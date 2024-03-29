const JsonDB = require('node-json-db').JsonDB;
const db = new JsonDB('tokens', true, false);

const {
  getSolaceApplicationDomains,
  getSolaceApplications,
  getSolaceApplicationVersions,
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
  buildApplicationEventBlocks,
  buildApplicationSchemaBlocks,
  buildApplicationVersionBlocks,
  buildEventBlocks,
  buildEventVersionBlocks,
  buildSchemaBlocks,
  buildSchemaVersionBlocks
} = require('./buildBlocks');
const {
  postUnregisteredMessage,
  checkArrayOfArrays,
  showHelp,
  showExamples
} = require('./appUtils')

const getMoreResources = async({ body, context, ack, respond }) => {
  console.log('action:getMoreResources');
  const { app, appSettings } = require('./app')
  let channel_name = body?.channel ? body?.channel.name : 'directmessage';
  if (channel_name === 'privategroup' || channel_name.indexOf('mpdm-') === 0) 
    channel_name = 'directmessage';

  let next = JSON.parse(body.actions[0].value);
  let cmd = next.cmd;
  let options = next.options;

  await ack();

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
  let response = undefined;
  let solaceCloudToken = undefined;
  try {
    db.reload();
    found = Object.entries(db.data).find(entry => { return entry[0] === body.user.id; });
    solaceCloudToken = found ? found[1] : undefined;
  } catch (error) {
    console.log(error);
  }

  try {
    if ((cmd.resource === 'domains')) {
      if (cmd.scope === 'name') options.name = cmd.name;
      if (cmd.scope === 'id') options.id = cmd.id;
      if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
      if (options.name)
        options.name = options.name.replaceAll('’', '\'').replaceAll('”', '"');
      response = await getSolaceApplicationDomains(cmd.scope, solaceCloudToken, options)
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildDomainBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta}); 
    } else if (cmd.resource === 'applications') {
      if (cmd.scope === 'name') options.name = cmd.name;
      if (cmd.scope === 'id') options.id = cmd.id;
      if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
      if (cmd.hasOwnProperty('domain')) options.domainName = cmd.domain;
      if (cmd.hasOwnProperty('domainId')) options.domainId = cmd.domainId;
      if (cmd.hasOwnProperty('type')) options.type = cmd.type;

      response = await getSolaceApplications(cmd.scope, solaceCloudToken, options);
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildApplicationBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta}); 
    } else if (cmd.resource === 'applicationversions') {
      if (cmd.scope === 'name') options.name = cmd.name;
      if (cmd.scope === 'id') options.id = cmd.id;
      if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
      if (cmd.hasOwnProperty('domain')) options.domainName = cmd.domain;
      if (cmd.hasOwnProperty('domainId')) options.domainId = cmd.domainId;
      if (cmd.hasOwnProperty('type')) options.type = cmd.type;

      response = await getSolaceApplicationVersions(cmd.scope, solaceCloudToken, options);
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildApplicationVersionBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta}); 
    } else if (cmd.resource === 'events') {
      if (cmd.scope === 'name') options.name = cmd.name;
      if (cmd.scope === 'id') options.id = cmd.id;
      if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
      if (cmd.hasOwnProperty('domain')) options.domainName = cmd.domain;
      if (cmd.hasOwnProperty('domainId')) options.domainId = cmd.domainId;
      if (cmd.hasOwnProperty('shared')) options.shared = cmd.shared.toUpperCase() === 'TRUE';

      response = await getSolaceEvents(cmd.scope, solaceCloudToken, options)
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildEventBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta}); 
    } else if (cmd.resource === 'eventverssions') {
      if (cmd.scope === 'name') options.name = cmd.name;
      if (cmd.scope === 'id') options.id = cmd.id;
      if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
      if (cmd.hasOwnProperty('domain')) options.domainName = cmd.domain;
      if (cmd.hasOwnProperty('domainId')) options.domainId = cmd.domainId;
      if (cmd.hasOwnProperty('shared')) options.shared = cmd.shared.toUpperCase() === 'TRUE';

      response = await getSolaceEventVersions(cmd.scope, solaceCloudToken, options)
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildEventVersionBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta}); 
    } else if (cmd.resource === 'schemas') {
        if (cmd.scope === 'name') options.name = cmd.name;
        if (cmd.scope === 'id') options.id = cmd.id;
        if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
        if (cmd.hasOwnProperty('domain')) options.domainName = cmd.domain;
        if (cmd.hasOwnProperty('domainId')) options.domainId = cmd.domainId;
        if (cmd.hasOwnProperty('shared')) options.shared = cmd.shared.toUpperCase() === 'TRUE';
  
        response = await getSolaceSchemas(cmd.scope, solaceCloudToken, options)
        if (!response.data.length)
          resultBlock = emptyBlock;
        else
          resultBlock = buildSchemaBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta});
    } else if (cmd.resource === 'schemaversions') {
        if (cmd.scope === 'name') options.name = cmd.name;
        if (cmd.scope === 'id') options.id = cmd.id;
        if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
        if (cmd.hasOwnProperty('domain')) options.domainName = cmd.domain;
        if (cmd.hasOwnProperty('domainId')) options.domainId = cmd.domainId;
        if (cmd.hasOwnProperty('shared')) options.shared = cmd.shared.toUpperCase() === 'TRUE';
  
        response = await getSolaceSchemaVersions(cmd.scope, solaceCloudToken, options)
        if (!response.data.length)
          resultBlock = emptyBlock;
        else
          resultBlock = buildSchemaVersionBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta});
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
    if (errorBlock) {
      if (channel_name === 'directmessage') {
        await respond({
          response_type: 'ephemeral',
          replace_original: false,
          text: 'Message from Solace App',
          blocks: errorBlock
        });
      } else {
        await app.client.chat.postEphemeral({
          token: appSettings.BOT_TOKEN, // process.env.SLACK_BOT_TOKEN,
          ts: body.container.message_ts,
          channel: body.channel.id,
          user: body.user.id,
          "blocks": errorBlock,
          text: 'Message from Solace App'
        });
      }
    } else {
      if (checkArrayOfArrays(resultBlock)) {
        for (let i=0; i<resultBlock.length; i++) {
          let chunkBlocks = [];
          for (let k=0;k<resultBlock[i].length;k+= 10) {
            const chunk = resultBlock[i].slice(k, k + 10);
            chunkBlocks.push(chunk);
          }      
            
          for (let k=0; k<chunkBlocks.length; k++) {
            if (channel_name === 'directmessage') {
              await respond({
                response_type: 'ephemeral',
                replace_original: false,
                text: 'Message from Solace App',
                blocks: chunkBlocks[k]
              });
            } else {
              await app.client.chat.postEphemeral({
                token: appSettings.BOT_TOKEN, // process.env.SLACK_BOT_TOKEN,
                ts: body.container.message_ts,
                channel: body.channel.id,
                user: body.user.id,
                "blocks": chunkBlocks[k],
                text: 'Message from Solace App'
              });  
            }
          }
        }
      } else {
        let chunkBlocks = [];
        for (let k=0;k<resultBlock.length;k+= 10) {
          const chunk = resultBlock.slice(k, k + 10);
          chunkBlocks.push(chunk);
        }
          
        for (let k=0; k<chunkBlocks.length; k++) {
          if (channel_name === 'directmessage') {
            await respond({
              response_type: 'ephemeral',
              replace_original: false,
              text: 'Message from Solace App',
              blocks: chunkBlocks[k]
            });
          } else {
            await app.client.chat.postEphemeral({
              token: appSettings.BOT_TOKEN, // process.env.SLACK_BOT_TOKEN,
              ts: body.container.message_ts,
              channel: body.channel.id,
              user: body.user.id,
              "blocks": chunkBlocks[k],
              text: 'Message from Solace App'
            });  
          }
        }
      }
    }
  } catch (error) {
    console.log('getMoreResources failed');
    console.log(error);
  }
}

const showHelpAction = async({ body, context, respond, ack }) => {
  console.log('action:showHelpAction');
  ack();

  let channel_name = body?.channel ? body?.channel.name : 'directmessage';
  if (channel_name === 'privategroup' || channel_name.indexOf('mpdm-') === 0) 
    channel_name = 'directmessage';

  await showHelp(body.channel.id, channel_name, body.user.id, respond);
}

const showExamplesAction = async({ body, context, respond, ack }) => {
  console.log('action:showExamplesAction');
  ack();

  let channel_name = body?.channel ? body?.channel.name : 'directmessage';
  if (channel_name === 'privategroup' || channel_name.indexOf('mpdm-') === 0) 
    channel_name = 'directmessage';

  await showExamples(body.channel.id, channel_name, body.user.id, body.actions[0].action_id, respond);
}

const authorizeEPTokenAction = async({ body, context, ack }) => {
  console.log('action:authorizeEPTokenAction');
  const { app, appSettings, cache } = require('./app')
  let channel_name = body?.channel ? body?.channel.name : 'directmessage';
  if (channel_name === 'privategroup' || channel_name.indexOf('mpdm-') === 0) 
    channel_name = 'directmessage';

  cache.set('channel_id', body.channel.id, 60);
  cache.set('channel_name', channel_name, 60);

  ack();
  
  const appHome = require('./appHome');
  let solaceCloudToken = undefined;
  try {
    db.reload();
    found = Object.entries(db.data).find(entry => { return entry[0] === body.user.id; });
    solaceCloudToken = found ? found[1] : undefined;
  } catch (error) {
    console.log(error);
  }

  try {
    const view = appHome.openModal(solaceCloudToken);
    await app.client.views.open({
      token: appSettings.BOT_TOKEN, // process.env.SLACK_BOT_TOKEN,
      trigger_id: body.trigger_id,
      view: view
    });    
  } catch(error) {
    console.log(error);
    app.error(error);
  }  
}

const fetchDependentResources = async({ ack, body, respond }) => {
  console.log('action:block_actions');
  const { app, appSettings } = require('./app')
  let channel_name = body?.channel ? body?.channel.name : 'directmessage';
  if (channel_name === 'privategroup' || channel_name.indexOf('mpdm-') === 0) 
    channel_name = 'directmessage';

  await ack();

  let solaceCloudToken = undefined;
  try {
    db.reload();
    found = Object.entries(db.data).find(entry => { return entry[0] === body.user.id; });
    solaceCloudToken = found ? found[1] : undefined;
  } catch (error) {
    console.log(error);
  }

  if (!solaceCloudToken) {
    await postUnregisteredMessage(body.channel.id, channel_name, body.user.id, respond);
    return;
  }

  let option = body.actions[0].selected_option.value;
  let data = option.split('|');
  let action = data[0];
  let resourceId = data[1];
  let resourceName = data[2];
  let domainId = data[3] ? data[3] : undefined;
  let domainName = data[4] ? data[4] : undefined;
  let resource = "Unknown";

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
    if (channel_name === 'directmessage') {
      await respond({
        response_type: 'ephemeral',
        replace_original: false,
        text: 'Message from Solace App',
        blocks: errorBlock
      });
    } else {
      await app.client.chat.postEphemeral({
        token: appSettings.BOT_TOKEN, // process.env.SLACK_BOT_TOKEN,
        ts: body.container.message_ts,
        channel: body.channel.id,
        user: body.user.id,
        "blocks": errorBlock,
        text: 'Message from Solace App'
      });
    }

    let response = undefined;

    let options = { }
    let cmd = { scope: 'all' }
    if (action === 'getdomainapplications') {
      options = { domainId: resourceId, pageSize: 5, pageNumber: 1 }
      cmd = { ...cmd, resource: 'applications'}
      response = await getSolaceApplications(cmd.scope, solaceCloudToken, options);
      if (!response.data.length)
        resultBlock = emptyBlock
      else
        resultBlock = buildApplicationBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta}); 
    } else if (action === 'getdomainevents') {
      options = { domainId: resourceId, pageSize: 5, pageNumber: 1 }
      cmd = { ...cmd, resource: 'events'}
      response = await getSolaceEvents(cmd.scope, solaceCloudToken, options)
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildEventBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta})
    } else if (action === 'getdomainschemas') {
      options = { domainId: resourceId, pageSize: 5, pageNumber: 1 }
      cmd = { ...cmd, resource: 'schemas'}
      response = await getSolaceSchemas(cmd.scope, solaceCloudToken, options)
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildSchemaBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta});
    } else if (action === 'getapplicationversions') {
      options = { domainId, domainName, pageSize: 5, pageNumber: 1 }
      cmd = { ...cmd, resource: 'applicationversions'}
      response = await getSolaceApplicationVersions(resourceId, solaceCloudToken, options)
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildApplicationVersionBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta})
    } else if (action === 'getapplicationevents') {
      options = { applicationId: resourceId, domainId, domainName, pageSize: 5, pageNumber: 1 }
      cmd = { ...cmd, resource: 'events'}
      response = await getSolaceApplicationEvents(resourceId, solaceCloudToken, options)
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildApplicationEventBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta})
    } else if (action === 'getapplicationschemas') {
      options = { applicationId: resourceId, domainId, domainName, pageSize: 5, pageNumber: 1 }
      cmd = { ...cmd, resource: 'schemas'}
      response = await getSolaceApplicationSchemas(resourceId, solaceCloudToken, options)
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildApplicationSchemaBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta});
    } else if (action === 'geteventversions') {
      options = { id: resourceId, name: resourceName, domainId, domainName, pageSize: 5, pageNumber: 1 }
      cmd = { ...cmd, resource: 'eventversions'}
      response = await getSolaceEventVersions(resourceId, solaceCloudToken, options)
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildEventVersionBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta})
    } else if (action === 'getschemaversions') {
      options = { id: resourceId, name: resourceName, domainId, domainName, pageSize: 5, pageNumber: 1 }
      cmd = { ...cmd, resource: 'schemaversions'}
      response = await getSolaceSchemaVersions(resourceId, solaceCloudToken, options)
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildSchemaVersionBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta});
    }
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
    if (errorBlock) {
      if (channel_name === 'directmessage') {
        await respond({
          response_type: 'ephemeral',
          replace_original: false,
          text: 'Message from Solace App',
          blocks: errorBlock
        });
      } else {
        await app.client.chat.postEphemeral({
          token: appSettings.BOT_TOKEN, // process.env.SLACK_BOT_TOKEN,
          ts: body.container.message_ts,
          channel: body.channel.id,
          user: body.user.id,
          "blocks": errorBlock,
          text: 'Message from Solace App'
        });
      }
    } else {
      if (checkArrayOfArrays(resultBlock)) {
        for (let i=0; i<resultBlock.length; i++) {
          let chunkBlocks = [];
          for (let k=0;k<resultBlock[i].length;k+= 10) {
            const chunk = resultBlock[i].slice(k, k + 10);
            chunkBlocks.push(chunk);
          }      
            
          for (let k=0; k<chunkBlocks.length; k++) {
            if (channel_name === 'directmessage') {
              await respond({
                response_type: 'ephemeral',
                replace_original: false,
                text: 'Message from Solace App',
                blocks: chunkBlocks[k]
              });
            } else {
              await app.client.chat.postEphemeral({
                token: appSettings.BOT_TOKEN, // process.env.SLACK_BOT_TOKEN,
                ts: body.container.message_ts,
                channel: body.channel.id,
                user: body.user.id,
                "blocks": chunkBlocks[k],
                text: 'Message from Solace App'
              });  
            }
          }
        }
      } else {
        let chunkBlocks = [];
        for (let k=0;k<resultBlock.length;k+= 10) {
          const chunk = resultBlock.slice(k, k + 10);
          chunkBlocks.push(chunk);
        }
          
        for (let k=0; k<chunkBlocks.length; k++) {
          if (channel_name === 'directmessage') {
            await respond({
              response_type: 'ephemeral',
              replace_original: false,
              text: 'Message from Solace App',
              blocks: chunkBlocks[k]
            });
          } else {
            await app.client.chat.postEphemeral({
              token: appSettings.BOT_TOKEN, // process.env.SLACK_BOT_TOKEN,
              ts: body.container.message_ts,
              channel: body.channel.id,
              user: body.user.id,
              "blocks": chunkBlocks[k],
              text: 'Message from Solace App'
            });  
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

const modifyEPTokenAction = async({ body, context, ack }) => {
  console.log('action:modifyEPTokenAction');
  const { app, appSettings } = require('./app')

  ack();
  
  const appHome = require('./appHome');

  let solaceCloudToken = undefined;
  try {
    db.reload();
    found = Object.entries(db.data).find(entry => { return entry[0] === body.user.id; });
    solaceCloudToken = found ? found[1] : undefined;
  } catch (error) {
    console.log(error);
  }

  // Open a modal window with forms to be submitted by a user
  const view = appHome.openModal(solaceCloudToken);
  
  try {
    await app.client.views.open({
      token: appSettings.BOT_TOKEN, // process.env.SLACK_BOT_TOKEN,
      trigger_id: body.trigger_id,
      view: view
    });    
  } catch(e) {
    console.log(e);
    app.error(e);
  }
}

module.exports = { 
  fetchDependentResources,
  authorizeEPTokenAction,
  modifyEPTokenAction,
  showHelpAction,
  showExamplesAction,
  getMoreResources
};