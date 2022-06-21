const EventPortal = require('./epwrapper')
const JsonDB = require('node-json-db').JsonDB;
const db = new JsonDB('tokens', true, false);
const {
  getSolaceApplications,
  getSolaceEvents,
  getSolaceSchemas,
  getSolaceApplicationVersions,
  getSolaceApplicationEvents,
  getSolaceApplicationSchemas,
} = require('./solCommands')
const {
  buildApplicationBlocks,
  buildEventBlocks,
  buildSchemaBlocks,
} = require('./buildBlocks');

const checkArrayOfArrays = (a) => {
  return a.every(function(x){ return Array.isArray(x); });
}

const blockActions = async({ ack, body, respond }) => {
  console.log('action:domain_block_actions');
  const { app } = require('./app')

  await ack();

  let option = body.actions[0].selected_option.value;
  let data = option.split('|');
  let action = data[0];
  let resourceId = data[1];
  let resourceName = data[2];
  let resource = "Unknown";
  console.log('action:block_actions', 'action: ', action, 'resourceId: ', resourceId, 'resourceName: ', resourceName);

  let solaceCloudToken = null;
  try {
    solaceCloudToken = db.getData(`/${body.user.id}/data`);
  } catch(error) {
    console.error(error); 
    return;
  }
    
  let actionDescription = 'Not Known';
  if (action === 'getdomainapplications') {
    actionDescription = "Applications of Domain _" + resourceName + "_";
    resource = 'Application';
  } else if (action === 'getdomainevents') {
    actionDescription = "Events of Domain _" + resourceName + "_";
    resource = 'Event';
  } else if (action === 'getdomainschemas') {
    actionDescription = "Schemas of Domain _" + resourceName + "_";
    resource = 'Schema';
  } else if (action === 'getapplicationevents') {
    actionDescription = "Events of Application _" + resourceName + "_";
    resource = 'Event';
  } else if (action === 'getapplicationschemas') {
    actionDescription = "Schemas of Application _" + resourceName + "_";
    resource = 'Schema';
  } 

  let headerBlock = [
    {
      type: "divider"
    },
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
  ];
  let inprogressBlock = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Fetching " + actionDescription + "*\n\n\n\n\n"
      },
    },
    {
      type: "divider"
    }
  ]
  let successBlock = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Command successfully executed!*\n\n\n"
      },
    },
    {
      type: "divider"
    }
  ]
  let emptyBlock = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "\n*No " + resource + "(s) found!*"
      },
    },
    {
      type: "divider"
    }
  ];      

  let resultBlock = [];
  let errorBlock = null;
  try {
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      ts: body.container.message_ts,
      channel: body.channel.id,
      "blocks": headerBlock,
      text: 'Message from Solace App'
    });

    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      ts: body.container.message_ts,
      channel: body.channel.id,
      "blocks": inprogressBlock,
      text: 'Message from Solace App'
    });

    let results = [];

    let options = { }
    if (action === 'getdomainapplications') {
      options = { domainId: resourceId }
      results = await getSolaceApplications('all', solaceCloudToken, options);
      if (!results.length)
        resultBlock = emptyBlock
      else
        resultBlock = buildApplicationBlocks(results, solaceCloudToken.domain)
    } else if (action === 'getdomainevents') {
      options = { domainId: resourceId }
      results = await getSolaceEvents('all', solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildEventBlocks(results, solaceCloudToken.domain)
    } else if (action === 'getdomainschemas') {
      options = { domainId: resourceId }
      results = await getSolaceSchemas('all', solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildSchemaBlocks(results, solaceCloudToken.domain);
    } else if (action === 'getapplicationversions') {
      results = await getSolaceApplicationVersions(resourceId, solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildEventBlocks(results, solaceCloudToken.domain)
    } else if (action === 'getapplicationevents') {
      options = { applictionId: resourceId }
      results = await getSolaceApplicationEvents('all', solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildEventBlocks(results, solaceCloudToken.domain)
    } else if (action === 'getapplicationschemas') {
      options = { applictionId: resourceId }
      results = await getSolaceApplicationSchemas('all', solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildSchemaBlocks(results, solaceCloudToken.domain);
    }

    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      ts: body.container.message_ts,
      channel: body.channel.id,
      "blocks": successBlock,
      text: 'Message from Solace App'
    });

    console.log('RESULT:', results);
  } catch (error) {
    console.error(error);
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
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      ts: body.container.message_ts,
      channel: body.channel.id,
      text: 'Message from Solace App',
      blocks
    });
  } catch (error) {
    if (errorBlock) 
      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        ts: body.container.message_ts,
        channel: body.channel.id,
        "blocks": errorBlock,
        text: 'Message from Solace App'
      });
    else {
      if (checkArrayOfArrays(resultBlock)) {
        for (let i=0; i<resultBlock.length; i++) {
          await app.client.chat.postMessage({
            token: process.env.SLACK_BOT_TOKEN,
            ts: body.container.message_ts,
            channel: body.channel.id,
              "blocks": resultBlock[i],
            text: 'Message from Solace App'
          });
        }
      } else {
        await app.client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          ts: body.container.message_ts,
          channel: body.channel.id,
            "blocks": resultBlock,
          text: 'Message from Solace App'
        });  
      }
    }
  }
}

const applicationBlockActions = async({ ack, body, respond }) => {
  console.log('action:application_block_actions');
  const { app } = require('./app')

  await ack();

  let option = body.actions[0].selected_option.value;
  let data = option.split('|');
  let action = data[0];
  let applicationId = data[1];
  let applicationName = data[2];
  let domainId = data[3];
  let domainName = data[4];
  console.log('action:application_block_actions', data);
  try {
    let solaceCloudToken = null;
    try {
      solaceCloudToken = db.getData(`/${body.user.id}/data`);
    } catch(error) {
      console.error(error); 
      return;
    };

    let actionDescription = 'Not Known';
    if (action === 'getapplicationversions')
      actionDescription = "Versons of Application _" + applicationName + "_";
    else if (action === 'getapplicationevents')
      actionDescription = "Events of Application _" + applicationName + "_";
    else if (action === 'getapplicationschemas')
      actionDescription = "Schemas of Application _" + applicationName + "_";

    let result = null;
    let params = null;
    let blocks = [
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*" + actionDescription + "!*\n\n"
          },
        },
        {
          type: "divider"
        }];

    const ep = new EventPortal(solaceCloudToken.token);
    if (action === 'getapplicationversions') {
      params = new URLSearchParams({ applicationDomainId: domainId }).toString();
      result = await ep.getApplicationVersions(applicationId, params);
      let states = { 1: "Draft", 2: "Released", 3: "Deprecated", 4: "Retired" }
      for (let rindex=0; rindex<result.length; rindex++) {
        let r = result[rindex];
        let events = {};
        for (let index=0; index<r.declaredProducedEventVersionIds.length; index++) {
          let e = r.declaredProducedEventVersionIds[index];
          if (!events.hasOwnProperty(e)) {
            let name = await ep.getEventByID(e);
            r.declaredProducedEventVersionIds[index] = { id: e, name };
            events[e] = r.declaredProducedEventVersionIds[index];
          } else {
            r.declaredProducedEventVersionIds[index] = events[e.id];
          }
        }
        for (let index=0; index<r.declaredConsumedEventVersionIds.length; index++) {
          let e = r.declaredConsumedEventVersionIds[index];
          if (!events.hasOwnProperty(e)) {
            let name = await ep.getEventByID(e);
            r.declaredConsumedEventVersionIds[index] = { id: e, name };
            events[e] = r.declaredProducedEventVersionIds[index];
          } else {
            r.declaredConsumedEventVersionIds[index] = events[e.id];
          }
        }
        
        r.state = states[r.stateId];
        r.domainName = domainName;
      }
      blocks = blocks.concat(buildApplicationVersionBlocks(result, solaceCloudToken.domain));
    } else if (action === 'getapplicationevents') {
      params = new URLSearchParams({ applicationDomainId: domainId }).toString();
      result = await ep.getEvents(params);
      for (let i=0; i<result.length; i++) {
        result[i].domainName = await ep.getApplicationDomainName(result[i].applicationDomainId)
        result[i].applicationId = applicationId;
        result[i].applicationName = applicationName;
      }

      blocks = blocks.concat(buildEventBlocks(result, solaceCloudToken.domain));
    } else if (action === 'getapplicationschemas') {
      params = new URLSearchParams({ applicationDomainId: domainId }).toString();
      result = await ep.getSchemas(params);
      for (let i=0; i<result.length; i++) {
        result[i].domainName = await ep.getApplicationDomainName(result[i].applicationDomainId)
        result[i].applicationId = applicationId;
        result[i].applicationName = applicationName;
      }

      blocks = blocks.concat(buildSchemaBlocks(result, solaceCloudToken.domain));
    } 

    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      ts: body.container.message_ts,
      channel: body.channel.id,
      text: 'Message from Solace App',
      blocks
    });
  } catch (error) {
    console.error(error);
  }
}

const eventBlockActions = async({ ack, body, respond }) => {
  console.log('action:event_block_actions');
  const { app } = require('./app')

  await ack();

  console.log('action:event_block_actions', body.actions);
  let option = body.actions[0].selected_option.value;
  let data = option.split('|');
  let action = data[0];
  let eventId = data[1];
  let eventName = data[2];
  let domainId = data[3];
  let domainName = data[4];

  try {
    let solaceCloudToken = null;
    try {
      solaceCloudToken = db.getData(`/${body.user.id}/data`);
    } catch(error) {
      console.error(error); 
      return;
    };
    
    let actionDescription = 'Not Known';
    if (action === 'geteventschemas')
      actionDescription = "Get Schemas of Event _" + eventName + "_";

    let result = null;
    let params = null;
    let blocks = [
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*" + actionDescription + "!*\n\n"
          },
        },
        {
          type: "divider"
        }];

    const ep = new EventPortal(solaceCloudToken.token);
    if (action === 'geteventschemas') {
      params = new URLSearchParams({ applicationDomainId: domainId }).toString();
      result = await ep.getSchemas(params);
      result = result.filter(r => r.applicationDomainId === domainId);
      result.forEach(r => r.domainName = domainName );
      blocks = blocks.concat(buildSchemaBlocks(result, solaceCloudToken.domain));
    } 

    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      ts: body.container.message_ts,
      channel: body.channel.id,
      text: 'Message from Solace App',
      blocks
    });
  } catch (error) {
    console.error(error);
  }
}

const schemaBlockActions = async({ ack, body, respond }) => {
  console.log('action:schema_block_actions');
  const { app } = require('./app')
  
  console.log('action:schema_block_actions', body.actions);

  await ack();
  await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    ts: body.container.message_ts,
    channel: body.channel.id,
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Hey, Will get you the " + (body.actions[0].selected_option.text.text.split(' ')[1]) + " soon :smile:!\n_To be implemented_"
        }
      }
    ],
    text: `To be implemented!`
  });

}

const addTokenAction = async({ body, context, ack }) => {
  console.log('action:add_token');
  const { app } = require('./app')

  ack();
  
  const appHome = require('./appHome');

  // Open a modal window with forms to be submitted by a user
  const view = appHome.openModal();
  
  try {
    const result = await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: view
    });    
  } catch(e) {
    console.log(e);
    app.error(e);
  }
}

module.exports = { 
  blockActions,
  applicationBlockActions,
  eventBlockActions,
  schemaBlockActions,
  addTokenAction
};