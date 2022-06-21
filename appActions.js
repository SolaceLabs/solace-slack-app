const EventPortal = require('./epwrapper')
const JsonDB = require('node-json-db').JsonDB;
const db = new JsonDB('tokens', true, false);
const {
  getSolaceApplications,
  getSolaceApplicationVersions,
  getSolaceApplicationEvents,
  getSolaceApplicationSchemas,
  getSolaceEvents,
  getSolaceEventVersions,
  getSolaceSchemas,

} = require('./solCommands')
const {
  buildApplicationBlocks,
  buildApplicationVersionBlocks,
  buildEventBlocks,
  buildEventVersionBlocks,
  buildSchemaBlocks,
} = require('./buildBlocks');

const checkArrayOfArrays = (a) => {
  return a.every(function(x){ return Array.isArray(x); });
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
  let applicationDomainId = data[3] ? data[3] : undefined;
  let domainName = data[4] ? data[4] : undefined;
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
      options = { applicationDomainId, domainName }
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
      options = { applictionId: resourceId, applicationDomainId, domainName }
      results = await getSolaceApplicationSchemas(resourceId, solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildSchemaBlocks(results, solaceCloudToken.domain);
    } else if (action === 'geteventversions') {
      options = { id: resourceId, name: resourceName, applicationDomainId, domainName }
      results = await getSolaceEventVersions(resourceId, solaceCloudToken, options)
      console.log(results);
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildEventVersionBlocks(results, solaceCloudToken.domain)
    } else if (action === 'geteventschemas') {
      options = { applicationDomainId, domainName }
      // results = await getSolaceEventSchemas(resourceId, solaceCloudToken, options)
      // if (!results.length)
      //   resultBlock = emptyBlock;
      // else
      //   resultBlock = buildSchemaBlocks(results, solaceCloudToken.domain)
      resultBlock = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "\n*Yet to be implemented!"
          },
        },
      ];      
    } else if (action === 'getschemaversions') {
      options = { applicationDomainId, domainName }
      // results = await getSolaceSchemaVersions(resourceId, solaceCloudToken, options)
      // if (!results.length)
      //   resultBlock = emptyBlock;
      // else
      //   resultBlock = buildSchemaVersionBlocks(results, solaceCloudToken.domain);
      resultBlock = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "\n*Yet to be implemented!"
          },
        },
      ]
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
  // applicationBlockActions,
  // eventBlockActions,
  // schemaBlockActions,
  addTokenAction
};