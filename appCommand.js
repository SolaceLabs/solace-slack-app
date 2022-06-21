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

const checkArrayOfArrays = (a) => {
  return a.every(function(x){ return Array.isArray(x); });
}

const echoSlashCommand = async({command, ack, respond}) => {  
  console.log('command:echoSlashCommand');

  await ack();

  await respond(`${command.text}`);
}

const quotes = ['\'', '"', '`', '’', '‘', "“", "”"];
const resources = ['domain', 'application', 'event', 'schema']
const needArgs = ['-resource', '-id', '-name', '-domain', '-type', '-shared', '-sort'];
const sharedArgs = ['true', 'false', 'TRUE', 'FALSE'];
const sortArgs = ['asc', 'desc', 'ASC', 'DESC'];

const stripQuotes = (str) => {
  let begin = 0, end = str.length;
  if (quotes.includes(str.charAt(0)))
    begin = 1;
  if (quotes.includes(str.charAt(str.length-1)))
    end = str.length-1;

  return str.substring(begin, end);
}

const isValidSolaceCommand = async (command, solaceCloudToken) => {
  let cmd = { valid: true};
  console.log('command:isValidSolaceCommand', command);

  if  (!command) {
    cmd.valid = false;
    return cmd;
  }

  let args = command.split(' ');
  console.log(args)
  for (let i=0; i<args.length; i++) {
    if (args[i] && quotes.includes(args[i].charAt(0)) && args[i+1]) {
      let quotedStr = args[i];
      for (let j=i+1; j<args.length; j++) {
        if (!needArgs.concat('-all').includes(args[j])) {
          quotedStr = quotedStr + ' ' + args[j];
          args[j] = undefined;
        } else {
          break;
        }
      }
      args[i] = quotedStr;
    }
  }
  console.log(args)

  for (let index=0; index<args.length; index++) {
    if (!args[index])
      continue;

    if (!needArgs.concat('-all').includes(args[index])) {
      cmd.error = 'Unknown parameter: ' + args[index];
      cmd.valid = false;
      console.log(cmd.error);
      break;
    }

    if (args[index] === '-all') {
      cmd['all'] = 'all';
      cmd['scope'] = 'all';
      args[index] = 'used';
      continue;
    }
  
    if (needArgs.includes(args[index]) && !args[index+1]) {
      cmd.error = 'Missing value for ' + args[index];
      cmd.valid = false;
      console.log(cmd.error);
      break;
    }
    console.log('STRIP: ' + args[index+1]);
    let nextArg = stripQuotes(args[index+1]);
    console.log('STRIPED: ' + nextArg);

    if (args[index] === '-resource') {
      cmd['resource'] = nextArg;
      if (!resources.includes(nextArg)) {
        cmd.error = 'Unknwon resource: ' + nextArg;
        cmd.valid = false;
        console.log(cmd.error);
        break;
      }
  
    } else if (args[index] === '-id') {
      cmd['scope'] = 'id';
      cmd['id'] = nextArg;
    } else if (args[index] === '-name') {
      cmd['scope'] = 'name';
      cmd['name'] = stripQuotes(nextArg);
    } else if (args[index] === '-type') {
      cmd['type'] = stripQuotes(nextArg);
    } else if (args[index] === '-domain') {
      cmd['domain'] = nextArg;
      try {
        cmd['domainId'] =  await getApplicationDomainId(cmd.domain, solaceCloudToken);
      } catch (error) {
        console.log(error);
        cmd.error = "Unknown domain: " + cmd.domain;
        cmd.valid = false;
        break;
      }

    } else if (args[index] === '-shared') {
      if (!sharedArgs.includes(nextArg)) {
        cmd.error = 'Invalid value for ' + args[index];
        cmd.valid = false;
        console.log(cmd.error);
        break;
      }
    
      cmd['shared'] = nextArg.toUpperCase();
    } else if (args[index] === '-sort') {
      if (!sortArgs.includes(nextArg)) {
        cmd.error = 'Invalid value for ' + args[index];
        cmd.valid = false;
        break;
      }
    
      cmd['sort'] = nextArg.toUpperCase();
    } else {
      cmd[args[index]] = nextArg;
    }
  
    args[index] = nextArg = 'used';
  
    index++;  
  }

  console.log('args: ', args);
  console.log('CMD: ', cmd);
  // check scope conflices
  if ((cmd.hasOwnProperty('all') && (cmd.hasOwnProperty('id') || cmd.hasOwnProperty('name')))
              || (cmd.hasOwnProperty('id') && (cmd.hasOwnProperty('all') || cmd.hasOwnProperty('name')))
              || (cmd.hasOwnProperty('name') && (cmd.hasOwnProperty('all') || cmd.hasOwnProperty('id')))
              || (cmd.hasOwnProperty('id') && cmd.hasOwnProperty('name'))) {
    cmd.error = "Conflicting scope";
    cmd.valid = false;
  } else if (!(cmd.hasOwnProperty('all') || cmd.hasOwnProperty('id') || cmd.hasOwnProperty('name'))) {
    cmd.error = "Missing scope";
    cmd.valid = false;
  }

  return cmd;
}

const solaceSlashCommand = async({ack, payload, context}) => {  
  console.log('command:solaceSlashCommand');
  const { app } = require('./app')
  console.log('Payload:', payload);

  let solaceCloudToken = null;
  try {
    solaceCloudToken = db.getData(`/${payload.user_id}/data`);
  } catch(error) {
    console.error(error); 
    return;
  }

  await ack();

  let cmd = await isValidSolaceCommand(payload.text, solaceCloudToken);
  console.log('Validated Command: ', cmd);
  if (!cmd.valid) {
    try {
      await app.client.chat.postMessage({
        token: context.botToken,
        channel: payload.channel_id,
        "blocks": [
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Invalid Solace command!*\n"
                      + (payload.command ? payload.command : "") + " " + (payload.text ? payload.text : "")
                      + "\n\n"
                      + (cmd.error ? "`" + cmd.error + "`\n\n" : "\n")
                      + "*Conventions:*\n"
                      + "*:one:* When an item is enclosed with < > symbols, the information requested is a variable and required.\n"
                      + "*:two:* When an item is enclosed with [ ] symbols, the information requested is optional.\n"
                      + "*:three:* When two or more options are separated by a | symbol, you may at most enter one of the options as part of the command.\n"
            },
            accessory: {
              type: "image",
              image_url: `https://cdn.solace.com/wp-content/uploads/2019/02/snippets-psc-animation-new.gif`,
              alt_text: "solace cloud"
            }    
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Get domain details\n" + "`/solace -resource domain [-all|-id <domain_id>|-name <domain_name>]  [-sort <ASC|DESC>]`\n"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Get application details\n" + "`/solace -resource application [-all|-id <appplication_id>|-name <application_name>]  [-domain <domain_name>] [-type <application_type>] [-sort <ASC|DESC>]`\n"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Get event details\n" + "`/solace -resource event [-all|-id <event_id>|-name <event_name>] [-domain <domain_name>] [-shared <true|false>] [-sort <ASC|DESC>]`\n"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Get  schema details\n" + "`/solace -resource schema [-all|-id <schema_id>|-name <schema_name>] [-domain <domain_name>] [-shared <true|false>] [-sort <ASC|DESC>]`\n"
            }
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

  console.log('COMMAND', cmd)
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
        text: "*Executing command...*\n\n\n\n\n" + payload.command + " " + payload.text
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
        text: (cmd.scope === 'all' ? "\n*No " + cmd.resource + "(s) found!*" : "\n*Error: Could not find " + cmd.resource + " by name: " + cmd.name + "!*")
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
      token: context.botToken,
      channel: payload.channel_id,
      "blocks": headerBlock,
      text: 'Message from Solace App'
    });

    await app.client.chat.postMessage({
      token: context.botToken,
      channel: payload.channel_id,
      "blocks": inprogressBlock,
      text: 'Message from Solace App'
    });

    let results = [];

    if ((cmd.resource === 'domain')) {
      let options = { mode: cmd.scope}
      if (cmd.scope === 'name') options.name = cmd.name;
      if (cmd.scope === 'id') options.id = cmd.id;
      if (cmd.hasOwnProperty('sort')) options.sort = cmd.sort.toLowerCase();
      results = await getSolaceApplicationDomains(cmd.scope, solaceCloudToken, options)
      if (!results.length)
        resultBlock = emptyBlock;
      else
        resultBlock = buildDomainBlocks(results, solaceCloudToken.domain);
    } else if (cmd.resource === 'application') {
      let options = { mode: cmd.scope}
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
        resultBlock = buildApplicationBlocks(results, solaceCloudToken.domain)
    } else if (cmd.resource === 'event') {
      let options = { mode: cmd.scope}
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
        resultBlock = buildEventBlocks(results, solaceCloudToken.domain)
    } else if (cmd.resource === 'schema') {
        let options = { mode: cmd.scope}
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
          resultBlock = buildSchemaBlocks(results, solaceCloudToken.domain);
    }

    await app.client.chat.postMessage({
      token: context.botToken,
      channel: payload.channel_id,
      "blocks": successBlock,
      text: 'Message from Solace App'
    });

    console.log('RESULT:', results);
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
        token: context.botToken,
        channel: payload.channel_id,
        "blocks": errorBlock,
        text: 'Message from Solace App'
      });
    else {
      if (checkArrayOfArrays(resultBlock)) {
        for (let i=0; i<resultBlock.length; i++) {
          await app.client.chat.postMessage({
            token: context.botToken,
            channel: payload.channel_id,
            "blocks": resultBlock[i],
            text: 'Message from Solace App'
          });
        }
      } else {
        await app.client.chat.postMessage({
          token: context.botToken,
          channel: payload.channel_id,
          "blocks": resultBlock,
          text: 'Message from Solace App'
        });  
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