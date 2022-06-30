const JsonDB = require('node-json-db').JsonDB;
const db = new JsonDB('tokens', true, false);
const {
  getSolaceApplicationDomains,
  getSolaceApplications,
  getSolaceEvents,
  getSolaceSchemas,
  getApplicationDomainId
} = require('./solCommands')
const {
  buildDomainBlocks,
  buildApplicationBlocks,
  buildEventBlocks,
  buildSchemaBlocks,
} = require('./buildBlocks');
const {
  postRegisterMessage,
  postAlreadyRegisteredMessage,
  checkArrayOfArrays,
  stripQuotes,
} = require('./appUtils');
const { showHelp, showExamples } = require('./appUtils');

const resources = ['domains', 'applications', 'events', 'schemas', 'register', 'help', 'examples']
const needArgs = ['name', 'domain', 'shared', 'sort'];
const sharedArgs = ['true', 'false', 'TRUE', 'FALSE'];
const sortArgs = ['asc', 'desc', 'ASC', 'DESC'];

const echoSlashCommand = async({command, ack, respond}) => {  
  console.log('command:echoSlashCommand');

  await ack();

  await respond(`${command.text}`);
}

const isValidSolaceCommand = async (command, solaceCloudToken) => {
  let cmd = { valid: true};
  console.log('command:isValidSolaceCommand');

  if  (!command) {
    cmd.valid = false;
    cmd.error = "Missing resource";
    return cmd;
  }

  let args = command.split(' ');
  for (let i=0; i<args.length; i++) {
    if (args[i] && (args[i].startsWith('name:') || args[i].startsWith('domain:'))) {
      let quotedStr = args[i];
      if (args[i+1]) {
        for (let j=i+1; j<args.length; j++) {
          if (args[j] && !(args[j].startsWith('name:') || args[j].startsWith('domain:') ||
                           args[j].startsWith('sort:') || args[j].startsWith('shared:'))) {
            quotedStr = quotedStr + ' ' + args[j];
            args[j] = undefined;
          }
        }
        args[i] = quotedStr;
      }
    }
  }
  if (!resources.includes(args[0])) {
    cmd.error = 'Unknown resource: `' + args[0] + '`';
    cmd.valid = false;
    console.log(cmd.error);
    return cmd;
  }

  cmd['resource'] = args[0];
  if (args.length === 1 || !cmd.hasOwnProperty('scope')) {
    cmd['scope'] = 'all';
    args[0] = 'used';
  }

  for (let index=1; index<args.length; index++) {
    if (!args[index])
      continue;

    if (args[index].indexOf(':') < 0) {
      cmd.error = 'Unknown parameter: `' + args[index] + '`';
      cmd.valid = false;
      console.log(cmd.error);
      return cmd;
    }

    let subArgs = [ args[index].substring(0, args[index].indexOf(':')), args[index].substring(args[index].indexOf(':')+1) ];
    if (!needArgs.includes(subArgs[0])) {
      cmd.error = 'Unknown parameter `' + subArgs[0] + '`';
      cmd.valid = false;
      console.log(cmd.error);
      return cmd;
    }

    if (needArgs.includes(subArgs[0]) && !subArgs[1]) {
      cmd.error = 'Missing value for parameter `' + subArgs[0] + '`';
      cmd.valid = false;
      console.log(cmd.error);
      return cmd;
    }

    let nextArg = stripQuotes(subArgs[1]);
    if (subArgs[0] === 'name') {
      cmd['scope'] = 'name';
      cmd['name'] = stripQuotes(nextArg);
    } else if (subArgs[0] === 'domain') {
      cmd['domain'] = nextArg;
      if (solaceCloudToken) {
        cmd['domainId'] =  await getApplicationDomainId(cmd.domain, solaceCloudToken);
        if (!cmd['domainId']) {
          cmd.error = "Unknown domain `" + cmd.domain + '`';
          cmd.valid = false;
          console.log(cmd.error);
          return cmd;
        }
      }
    } else if (subArgs[0] === 'shared') {
      if (!sharedArgs.includes(nextArg)) {
        cmd.error = 'Invalid value for parameter `' + subArgs[0] + '`';
        cmd.valid = false;
        console.log(cmd.error);
        return cmd;
      }
    
      cmd['shared'] = nextArg.toUpperCase();
    } else if (subArgs[0] === 'sort') {
      if (!sortArgs.includes(nextArg)) {
        cmd.error = 'Invalid value for `' + subArgs[0] + '`';
        cmd.valid = false;
        return cmd;
      }
    
      cmd['sort'] = nextArg.toUpperCase();
    } else {
      cmd[subArgs[0]] = nextArg;
    }
  
    args[index] = nextArg = 'used';
  }

  console.log('CMD: ', cmd);
  return cmd;
}

const alreadyRegistered = [
  {
    type: "divider"
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":wave: *Yay, you have already registered wih Solace PubSub+ Event Portal, you are all set!*\n\n"
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Show help"
        },
        action_id: "click_show_help"
      },
    ]
  },
  {
    type: "divider"
  },  
];

const solaceSlashCommand = async({ack, payload, context}) => {  
  console.log('command:solaceSlashCommand');
  const { app } = require('./app')

  await ack();

  let solaceCloudToken = undefined;
  try {
    db.reload();
    solaceCloudToken = db.getData(`/${payload.user_id}/data`);
  } catch(error) {
    console.error(error); 
  }


  if (!solaceCloudToken) {
    await postRegisterMessage(payload.channel_id, payload.user_id);
    return;  
  }

  let cmd = await isValidSolaceCommand(payload.text, solaceCloudToken);
  console.log('Validated Command: ', cmd);
  if (!cmd.valid) {
    try {
      await app.client.chat.postEphemeral({
        token: process.env.SLACK_BOT_TOKEN,
        channel: payload.channel_id,
        user: payload.user_id,
        "blocks": [
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: ":no_entry_sign: *Invalid Solace command!*\n\n"
                      + (payload.command ? payload.command : "") + " " + (payload.text ? payload.text : "") 
                      + "\n\n"
                      + "_" + cmd.error + "_"
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Show help"
                },
                action_id: "click_show_help"
              },
            ]
          },
          {
            type: "divider"
          },
        ],
        // Text in the notification
        text: 'Message from Solace App'
      });
    } catch (error) {
      console.error(error);
    }
    return;
  } 

  if (cmd.resource === 'help') {
    console.log('command:showHelpCommand');
    await showHelp(payload.user_id, payload.channel_id);
    return;
  }
  if (cmd.resource === 'examples') {
    console.log('command:showExamplesCommand');
    await showExamples(payload.user_id, payload.channel_id);
    return;
  }
  if (cmd.resource === 'register') {
    if (solaceCloudToken) {
      await postAlreadyRegisteredMessage(payload.channel_id, payload.user_id);
      return;  
    }
    console.log('command:showExamplesCommand');
    await showExamples(payload.user_id, payload.channel_id);
    return;
  }

  if (!solaceCloudToken) {
    await postRegisterMessage(payload.channel_id, payload.user_id);
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
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Executing command...*\n\n\n" + payload.command + " " + payload.text
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

  let emptyBlock = [];
  if (cmd.scope === 'all') {
    emptyBlock.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "\n*No " + cmd.resource + "(s) found!*"
      },
    });
  } else {
    emptyBlock.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "\n*_Could not find " + cmd.resource + " by name: `" + cmd.name + "`"
                + (cmd.hasOwnProperty('shared') ? " with shared setting `" + cmd.shared + "`" : "")
                + "_*" 
      },
    });
  }
  emptyBlock.push({
      type: "divider"
    });

  let resultBlock = [];
  let errorBlock = null;
  try {
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: payload.channel_id,
      "blocks": headerBlock,
      text: 'Message from Solace App'
    });

    let response = undefined;

    if ((cmd.resource === 'domains')) {
      let options = { mode: cmd.scope, pageSize: 5, pageNumber: 1}
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
      let options = { mode: cmd.scope, pageSize: 5, pageNumber: 1}
      if (cmd.scope === 'name') options.name = cmd.name;
      if (cmd.scope === 'id') options.id = cmd.id;
      if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
      if (cmd.hasOwnProperty('domain')) options.domainName = cmd.domain;
      if (cmd.hasOwnProperty('domainId')) options.domainId = cmd.domainId;
      if (cmd.hasOwnProperty('type')) options.type = cmd.type;
      if (options.name)
        options.name = options.name.replaceAll('’', '\'').replaceAll('”', '"');

      response = await getSolaceApplications(cmd.scope, solaceCloudToken, options);
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildApplicationBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta});
    } else if (cmd.resource === 'events') {
      let options = { mode: cmd.scope, pageSize: 5, pageNumber: 1}
      if (cmd.scope === 'name') options.name = cmd.name;
      if (cmd.scope === 'id') options.id = cmd.id;
      if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
      if (cmd.hasOwnProperty('domain')) options.domainName = cmd.domain;
      if (cmd.hasOwnProperty('domainId')) options.domainId = cmd.domainId;
      if (cmd.hasOwnProperty('shared')) options.shared = cmd.shared.toUpperCase() === 'TRUE';
      if (options.name)
        options.name = options.name.replaceAll('’', '\'').replaceAll('”', '"');

      response = await getSolaceEvents(cmd.scope, solaceCloudToken, options);
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildEventBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta});
    } else if (cmd.resource === 'schemas') {
      let options = { mode: cmd.scope, pageSize: 5, pageNumber: 1}
      if (cmd.scope === 'name') options.name = cmd.name;
      if (cmd.scope === 'id') options.id = cmd.id;
      if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
      if (cmd.hasOwnProperty('domain')) options.domainName = cmd.domain;
      if (cmd.hasOwnProperty('domainId')) options.domainId = cmd.domainId;
      if (cmd.hasOwnProperty('shared')) options.shared = cmd.shared.toUpperCase() === 'TRUE';
      if (options.name)
        options.name = options.name.replaceAll('’', '\'').replaceAll('”', '"');

      response = await getSolaceSchemas(cmd.scope, solaceCloudToken, options)
      if (!response.data.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildSchemaBlocks(response.data, solaceCloudToken.domain, {cmd, options, meta: response.meta});
    }

    // await app.client.chat.postMessage({
    //   token: process.env.SLACK_BOT_TOKEN,
    //   channel: payload.channel_id,
    //   "blocks": successBlock,
    //   text: 'Message from Solace App'
    // });

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
        channel: payload.channel_id,
        "blocks": errorBlock,
        text: 'Message from Solace App'
      });
    else {
      if (checkArrayOfArrays(resultBlock)) {
        for (let i=0; i<resultBlock.length; i++) {
          let chunkBlocks = [];
          for (let k=0;k<resultBlock[i].length;k+= 10) {
            const chunk = resultBlock[i].slice(k, k + 10);
            chunkBlocks.push(chunk);
          }      
            
          for (let k=0; k<chunkBlocks.length; k++) {
            await app.client.chat.postMessage({
              token: process.env.SLACK_BOT_TOKEN,
              channel: payload.channel_id,
              "blocks": chunkBlocks[k],
              text: 'Message from Solace App'
            });  
          }
        }
      } else {
        let chunkBlocks = [];
        for (let k=0;k<resultBlock.length;k+= 10) {
          const chunk = resultBlock.slice(k, k + 10);
          chunkBlocks.push(chunk);
        }
          
        for (let k=0; k<chunkBlocks.length; k++) {
          await app.client.chat.postMessage({
            token: process.env.SLACK_BOT_TOKEN,
            channel: payload.channel_id,
            "blocks": chunkBlocks[k],
            text: 'Message from Solace App'
          });  
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = { 
  echoSlashCommand,
  solaceSlashCommand
};