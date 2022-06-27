const EventPortal = require('./epwrapper')
const JsonDB = require('node-json-db').JsonDB;
const db = new JsonDB('tokens', true, false);

const {
  getSolaceApplicationDomains,
  getSolaceApplications,
  getSolaceApplicationVersions,
  getSolaceEvents,
  getSolaceEventVersions,
  getSolaceSchemas,
  getSolaceSchemaVersions

} = require('./solCommands')
const {
  buildDomainBlocks,
  buildApplicationBlocks,
  buildApplicationVersionBlocks,
  buildEventBlocks,
  buildEventVersionBlocks,
  buildSchemaBlocks,
  buildSchemaVersionBlocks
} = require('./buildBlocks');

const checkArrayOfArrays = (a) => {
  return a.every(function(x){ return Array.isArray(x); });
}

const postLinkAccountMessage = async (channel, user, token) => {
  const { app } = require('./app')
  
  try {
    let blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Discover, Visualize and Catalog Your Event Streams With PubSub+ Event Portal*\n\n\n"
        },
        accessory: {
          type: "image",
          image_url: `https://cdn.solace.com/wp-content/uploads/2019/02/snippets-psc-animation-new.gif`,
          alt_text: "solace cloud"
        }    
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Hello! Before I can help, I need you to register a valid API Token to access Solace Event Portal. "
                + "It just takes a second, and then you'll be all set. "
                + "Just click on the link below."
        },
      },      
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Register"
            },
            style: "primary",
            action_id: "click_authorize"
          },
        ]
      }
    ]

    await app.client.chat.postEphemeral({
      token: token,
      channel: channel,
      user: user,
      "blocks": blocks,
      text: 'Message from Solace App'
    });

  } catch (error) {
    console.log('postLinkAccountMessage failed');
    console.log(error);
  }
}
        
const parseSolaceLink = (link) => {
  let url = new URL(link.replaceAll('&amp;', '&'));
  if (!url.pathname.startsWith('/ep'))
    return false;

  let cmd = {};
  let vals = url.pathname.split('/');
  for (let j=0; j<vals.length; j++) {
    if (vals[j] === 'domains') {
      cmd.resource = 'domain';            
      if (!vals[j+1]) {
        cmd.scope = 'all';
      } else {
        cmd.scope = 'id';
        cmd.domainId = vals[j+1]
      }
    }
    if (vals[j] === 'applications' && vals[j+1]) {
      cmd.resource = 'application';            
      if (!vals[j+1]) {
        cmd.scope = 'all';
      } else {
        cmd.scope = 'id';
        cmd.applicationId = vals[j+1]
      }
    }
    if (vals[j] === 'events' && vals[j+1]) {
      cmd.resource = 'event';            
      if (!vals[j+1]) {
        cmd.scope = 'all';
      } else {
        cmd.scope = 'id';
        cmd.eventId = vals[j+1]
      }
    }
    if (vals[j] === 'schemas' && vals[j+1]) {
      cmd.resource = 'schema';            
      if (!vals[j+1]) {
        cmd.scope = 'all';
      } else {
        cmd.scope = 'id';
        cmd.schemaId = vals[j+1]
      }
    }
  }

  if (url.pathname.indexOf('/domains/') > 0 || url.pathname.indexOf('/domains?') > 0 ||url.pathname.endsWith('/domains')) {
    cmd.scope = 'all';
    cmd.resource = 'domain';
    if (url.searchParams.has('selectedDomainId')) {
      cmd.scope = 'id';
      cmd.resource = 'domain';
      cmd.domainId = url.searchParams.get('selectedDomainId');
    }
    if (cmd.domainId) {
      cmd.scope = 'id'
    }
  }

  if (url.pathname.indexOf('/applications/') > 0 || url.pathname.indexOf('/applications?') > 0 ||url.pathname.endsWith('/applications')) {
    cmd.scope = 'all';
    cmd.resource = 'application';
    if (url.searchParams.has('selectedId')) {
      cmd.scope = 'id';
      cmd.resource = 'application';
      cmd.applicationId = url.searchParams.get('selectedId');
    }
    if (url.searchParams.has('selectedVersionId')) {
      cmd.scope = 'id';
      cmd.resource = 'application';
      cmd.versionId = url.searchParams.get('selectedVersionId');
    }
    if (cmd.applicationId) {
      cmd.scope = 'id'
    }
  }
  if (url.pathname.indexOf('/events/') > 0 || url.pathname.indexOf('/events?') > 0 ||url.pathname.endsWith('/events')) {
    cmd.scope = 'all';
    cmd.resource = 'event';
    if (url.searchParams.has('selectedId')) {
      cmd.scope = 'id';
      cmd.resource = 'event';
      cmd.eventId = url.searchParams.get('selectedId');
    }
    if (url.searchParams.has('selectedVersionId')) {
      cmd.scope = 'id';
      cmd.resource = 'event';
      cmd.versionId = url.searchParams.get('selectedVersionId');
    }
    if (cmd.eventId) {
      cmd.scope = 'id'
    }
  }

  if (url.pathname.indexOf('/schemas/') > 0 || url.pathname.indexOf('/schemas?') > 0 ||url.pathname.endsWith('/schemas')) {
    cmd.scope = 'all';
    cmd.resource = 'schema';
    if (url.searchParams.has('selectedId')) {
      cmd.scope = 'id';
      cmd.resource = 'schema';
      cmd.schemaId = url.searchParams.get('selectedId');
    }
    if (url.searchParams.has('selectedVersionId')) {
      cmd.scope = 'id';
      cmd.resource = 'schema';
      cmd.versionId = url.searchParams.get('selectedVersionId');
    }
    if (cmd.schemaId) {
      cmd.scope = 'id'
    }
  }

  for (const [key, value] of url.searchParams.entries())  
    cmd[key] = value;

  console.log('cmd:', cmd);
  return cmd;
}

const appHomeOpenedEvent = async({event, context, payload}) => {
  console.log('bot:app_home_opened');
  const { app } = require('./app')
  const appHome = require('./appHome');

  const userId = payload.user;

  // Display App Home
  const homeView = await appHome.createHome(userId);
  
  try {
    const result = await app.client.views.publish({
      token: process.env.SLACK_BOT_TOKEN,
      user_id: event.user,
      view: homeView
    });
    
  } catch(e) {
    app.error(e);
  }  
}

const appLinkSharedEvent = async({event, context, payload}) => {
  console.log('bot:link_shared');
  const { app } = require('./app')

  let resultBlock = [];
  let errorBlock = null;

  for (var i=0; i<payload.links.length; i++) {
    try {
      let unfurledData = [];
      let cmd = parseSolaceLink(payload.links[i].url);
      let solaceCloudToken = undefined;
      try {
        db.reload();
        solaceCloudToken = db.getData(`/${payload.user}/data`);
      } catch(error) {
        console.error(error); 
      }
    
      if (!solaceCloudToken) {
        await postLinkAccountMessage(payload.channel, payload.user_id, process.env.SLACK_BOT_TOKEN);
        return;
      }
      
      const headerBlock = [
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Discover, Visualize and Catalog Your Event Streams With PubSub+ Event Portal*\n\n"
          },
          accessory: {
            type: "image",
            image_url: `https://cdn.solace.com/wp-content/uploads/2019/02/snippets-psc-animation-new.gif`,
            alt_text: "solace cloud"
          }    
        },
        {
          type: "divider"
        }
      ]
    
      let results = [];
      if (cmd.resource === 'domain') {
        let options = { id: cmd.domainId, pageSize: 1, pageNumber: 1}
        results = await getSolaceApplicationDomains(cmd.scope, solaceCloudToken, options)
        if (!results.length)
          resultBlock = emptyBlock;
        else {
          resultBlock = buildDomainBlocks(results, solaceCloudToken.domain, {cmd, options}); 
          resultBlock[0] = headerBlock.concat(resultBlock[0]);
        } 

      } else if (cmd.resource === 'application') {
        let options = { id: cmd.applicationId, domainId: cmd.domainId, domainName: cmd.domainName, 
                        versionId: cmd.versionId, pageSize: 1, pageNumber: 1}
        if (cmd.versionId) {
          results = await getSolaceApplicationVersions(cmd.applicationId, solaceCloudToken, options)
          if (!results.length)
            resultBlock = emptyBlock;
          else
            resultBlock = buildApplicationVersionBlocks(results, solaceCloudToken.domain, {cmd, options});        
        } else {
          results = await getSolaceApplications(cmd.scope, solaceCloudToken, options)
          if (!results.length)
            resultBlock = emptyBlock;
          else
            resultBlock = buildApplicationBlocks(results, solaceCloudToken.domain, {cmd, options});        
        }        
      } 
      else if (cmd.resource === 'event') {
        let options = { id: cmd.eventId, domainId: cmd.domainId, domainName: cmd.domainName, 
                        versionId: cmd.versionId, pageSize: 1, pageNumber: 1}
        if (cmd.versionId) {
          results = await getSolaceEventVersions(cmd.eventId, solaceCloudToken, options)
          if (!results.length)
            resultBlock = emptyBlock;
          else
            resultBlock = buildEventVersionBlocks(results, solaceCloudToken.domain, {cmd, options});        
        } else {
          results = await getSolaceEvents(cmd.scope, solaceCloudToken, options)
          if (!results.length)
            resultBlock = emptyBlock;
          else
            resultBlock = buildEventBlocks(results, solaceCloudToken.domain, {cmd, options});        
        }        
      } else if (cmd.resource === 'schema') {
        let options = { id: cmd.schemaId, domainId: cmd.domainId, domainName: cmd.domainName, 
                        versionId: cmd.versionId, pageSize: 1, pageNumber: 1}
        if (cmd.versionId) {
          results = await getSolaceSchemaVersions(cmd.schemaId, solaceCloudToken, options)
          if (!results.length)
            resultBlock = emptyBlock;
          else
            resultBlock = buildSchemaVersionBlocks(results, solaceCloudToken.domain, {cmd, options});        
        } else {
          results = await getSolaceSchemas(cmd.scope, solaceCloudToken, options)
          if (!results.length)
            resultBlock = emptyBlock;
          else
            resultBlock = buildSchemaBlocks(results, solaceCloudToken.domain, {cmd, options});        
        }   
      }
    } catch (error) {
      errorBlock = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: error.message
          },
        },
        {
          type: "divider"
        }
      ]
    }

    try {
      if (errorBlock) 
        await app.client.chat.postEphemeral({
          token: process.env.SLACK_BOT_TOKEN,
          channel: payload.channel,
          user: payload.user,
          blocks,
          text: 'Unfurl error'
        });
      else {
        if (checkArrayOfArrays(resultBlock)) {
          for (let j=0; j<resultBlock.length; j++) {
          
            let unfurls = {};
            unfurls[payload.links[i].url] = {
              blocks: resultBlock[j]
            }
                  
            await app.client.chat.unfurl({
              token: process.env.SLACK_BOT_TOKEN,
              ts: event.message_ts,
              channel: payload.channel,
              unfurls: JSON.stringify(unfurls),
              text: 'Unfurl successful'
            });
          }
        } else {          
          let unfurls = {};
          unfurls[payload.links[i].url] = {
            blocks: resultBlock
          }
              
          await app.client.chat.unfurl({
            token: process.env.SLACK_BOT_TOKEN,
            ts: event.message_ts,
            channel: payload.channel,
            unfurls: JSON.stringify(unfurls),
            text: 'Unfurl successful'
          });
        }
    
      }
    } catch (error) {
      console.error(error);
    }    
  }
}

module.exports = { 
  appHomeOpenedEvent,
  appLinkSharedEvent
};