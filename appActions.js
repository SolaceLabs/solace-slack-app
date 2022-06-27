const JsonDB = require('node-json-db').JsonDB;
const db = new JsonDB('tokens', true, false);
const {
  getSolaceApplicationDomains,
  getSolaceApplications,
  getSolaceApplicationVersions,
  getSolaceApplicationVersionById,
  getSolaceApplicationEvents,
  getSolaceApplicationSchemas,
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
const {
  postRegisterMessage,
  checkArrayOfArrays,
  showHelp,
  showExamples
} = require('./appUtils')

const getMoreResources = async({ body, context, ack }) => {
  console.log('action:getMoreResources');
  const { app } = require('./app')

  ack();
  let next = JSON.parse(body.actions[0].value);
  let cmd = next.cmd;
  let options = next.options;

  let solaceCloudToken = undefined;
  try {
    db.reload();
    solaceCloudToken = db.getData(`/${body.user.id}/data`);
  } catch(error) {
    console.error(error); 
  }


  let blocks = [
    {
      type: "divider"
    },
    {
      "type": "section",
      text: {
        type: "mrkdwn",
        "text": "*Application Domains*"
      },
    },
  ];

  let emptyBlock = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "\n*No more " +next.cmd.resource + "(s) found!*"
      },
    },
    {
      type: "divider"
    }];

  let resultBlock = [];
  let errorBlock = null;
  try {
    if ((cmd.resource === 'domain')) {
      if (cmd.scope === 'name') options.name = cmd.name;
      if (cmd.scope === 'id') options.id = cmd.id;
      if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
      if (options.name)
        options.name = options.name.replaceAll('’', '\'').replaceAll('”', '"');
      results = await getSolaceApplicationDomains(cmd.scope, solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildDomainBlocks(results, solaceCloudToken.domain, {cmd, options}); 
      } else if (cmd.resource === 'application') {
        if (cmd.scope === 'name') options.name = cmd.name;
        if (cmd.scope === 'id') options.id = cmd.id;
        if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
        if (cmd.hasOwnProperty('domain')) options.domainName = cmd.domain;
        if (cmd.hasOwnProperty('domainId')) options.domainId = cmd.domainId;
        if (cmd.hasOwnProperty('type')) options.type = cmd.type;
  
        results = await getSolaceApplications(cmd.scope, solaceCloudToken, options);
        if (!results.length)
          resultBlock = emptyBlock
        else
          resultBlock = buildApplicationBlocks(results, solaceCloudToken.domain, {cmd, options})
      } else if (cmd.resource === 'event') {
        if (cmd.scope === 'name') options.name = cmd.name;
        if (cmd.scope === 'id') options.id = cmd.id;
        if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
        if (cmd.hasOwnProperty('domain')) options.domainName = cmd.domain;
        if (cmd.hasOwnProperty('domainId')) options.domainId = cmd.domainId;
        if (cmd.hasOwnProperty('shared')) options.shared = cmd.shared.toUpperCase() === 'TRUE';
  
        results = await getSolaceEvents(cmd.scope, solaceCloudToken, options)
        if (!results.length)
          resultBlock = emptyBlock;
        else
          resultBlock = buildEventBlocks(results, solaceCloudToken.domain, {cmd, options})
      } else if (cmd.resource === 'schema') {
          if (cmd.scope === 'name') options.name = cmd.name;
          if (cmd.scope === 'id') options.id = cmd.id;
          if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
          if (cmd.hasOwnProperty('domain')) options.domainName = cmd.domain;
          if (cmd.hasOwnProperty('domainId')) options.domainId = cmd.domainId;
          if (cmd.hasOwnProperty('shared')) options.shared = cmd.shared.toUpperCase() === 'TRUE';
    
          results = await getSolaceSchemas(cmd.scope, solaceCloudToken, options)
          if (!results.length)
            resultBlock = emptyBlock;
          else
            resultBlock = buildSchemaBlocks(results, solaceCloudToken.domain, {cmd, options});
      }
  } catch (error) {
    console.error("CAUGHT ERROR: ", error);
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
      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
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
  } catch (error) {
    console.log('getMoreResources failed');
    console.log(error);
  }
}

const showHelpAction = async({ body, context, ack }) => {
  console.log('action:showHelpAction', body);
  ack();

  await showHelp(body.user.id, body.channel.id);
}

const showExamplesAction = async({ body, context, ack }) => {
  console.log('action:showExamplesAction');
  ack();

  await showExamples(body.user.id, body.channel.id, body.actions[0].action_id);
}

const authorizeEPTokenAction = async({ body, context, ack }) => {
  console.log('action:authorizeEPTokenAction', body);
  const { app, cache } = require('./app')

  ack();
  
  const appHome = require('./appHome');
  let solaceCloudToken = undefined;
  try {
    db.reload();
    solaceCloudToken = db.getData(`/${body.user.id}/data`);
  } catch(error) {
    // ignore
  }

  cache.set('channelId', body.channel.id, 60);

  const view = appHome.openModal(solaceCloudToken);
  
  try {
    await app.client.views.open({
      token: process.env.SLACK_BOT_TOKEN,
      trigger_id: body.trigger_id,
      view: view
    });    
  } catch(error) {
    console.log(error);
    app.error(error);
  }  
}

const blockActions = async({ ack, body, respond }) => {
  console.log('action:block_actions');
  const { app } = require('./app')

  await ack();

  let option = body.actions[0].selected_option.value;
  let data = option.split('|');
  let action = data[0];
  let resourceId = data[1];
  let resourceName = data[2];
  let domainId = data[3] ? data[3] : undefined;
  let domainName = data[4] ? data[4] : undefined;
  let resource = "Unknown";
  console.log('action:block_actions');

  let solaceCloudToken = undefined;
  try {
    solaceCloudToken = db.getData(`/${body.user.id}/data`);
  } catch(error) {
    console.error(error); 
  }

  if (!solaceCloudToken) {
    await postRegisterMessage(body.channel.id, body.user.id);
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
  } else if (action === 'getapplicationversions') {
    actionDescription = "Versions of Application _" + resourceName + "_";
    resource = 'Application';
  } else if (action === 'getapplicationevents') {
    actionDescription = "Events of Application _" + resourceName + "_";
    resource = 'Event';
  } else if (action === 'getapplicationschemas') {
    actionDescription = "Schemas of Application _" + resourceName + "_";
    resource = 'Schema';
  } else if (action === 'geteventversions') {
    actionDescription = "Versions of Event _" + resourceName + "_";
    resource = 'Event';
  } else if (action === 'geteventschemas') {
    actionDescription = "Schemas of Event _" + resourceName + "_";
    resource = 'Schema';
  } else if (action === 'getschemaversions') {
    actionDescription = "Versions of Schema _" + resourceName + "_";
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
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "\n\n\n\n\n*Fetching " + actionDescription + "*"
      },
    },
    {
      type: "divider"
    }
  ];
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
      options = { domainId, domainName }
      results = await getSolaceApplicationVersions(resourceId, solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildApplicationVersionBlocks(results, solaceCloudToken.domain)
    } else if (action === 'getapplicationevents') {
      options = { applictionId: resourceId }
      results = await getSolaceApplicationEvents(resourceId, solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildEventBlocks(results, solaceCloudToken.domain)
    } else if (action === 'getapplicationschemas') {
      options = { applictionId: resourceId, domainId, domainName }
      results = await getSolaceApplicationSchemas(resourceId, solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildSchemaBlocks(results, solaceCloudToken.domain);
    } else if (action === 'geteventversions') {
      options = { id: resourceId, name: resourceName, domainId, domainName }
      results = await getSolaceEventVersions(resourceId, solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildEventVersionBlocks(results, solaceCloudToken.domain)
    } else if (action === 'getschemaversions') {
      options = { id: resourceId, name: resourceName, domainId, domainName }
      results = await getSolaceSchemaVersions(resourceId, solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildSchemaVersionBlocks(results, solaceCloudToken.domain);
    }

    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      ts: body.container.message_ts,
      channel: body.channel.id,
      "blocks": successBlock,
      text: 'Message from Solace App'
    });

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

const modifyEPTokenAction = async({ body, context, ack }) => {
  console.log('action:modifyEPTokenAction');
  const { app } = require('./app')

  ack();
  
  const appHome = require('./appHome');
  let solaceCloudToken = undefined;
  try {
    db.reload();
    solaceCloudToken = db.getData(`/${body.user.id}/data`);
  } catch(error) {
    // ignore
  }

  // Open a modal window with forms to be submitted by a user
  const view = appHome.openModal(solaceCloudToken);
  
  try {
    const result = await app.client.views.open({
      token: process.env.SLACK_BOT_TOKEN,
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
  authorizeEPTokenAction,
  modifyEPTokenAction,
  showHelpAction,
  showExamplesAction,
  getMoreResources
};