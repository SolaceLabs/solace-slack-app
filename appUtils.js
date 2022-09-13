const checkArrayOfArrays = (a) => {
  return a.every(function(x){ return Array.isArray(x); });
}

const postAlreadyRegisteredMessage = async (payload, respond) => {
  const { app, appSettings, cache } = require('./app')
  const channel_id = payload.channel_id;
  const channel_name = payload.channel_name;
  const user_id = payload.user_id;
  
  cache.set('channel_id', channel_id, 60);
  cache.set('channel_name', channel_name, 60);

  const blocks = [
    {
      type: "divider"
    },
    {
      "type": "section",
      text: {
        type: "mrkdwn",
        "text": ":thumbsup: *You have already registered, you're all set!*\n\n"
      },
    },
    {
      "type": "section",
      text: {
        type: "mrkdwn",
        "text": "If you want to update the token, go to " +
                "<slack://app?team=" + payload.team_id + "&id=" + payload.api_app_id + "&tab=home" + 
                "|*Solace App Home*> in the Apps list and update the token."
      },
    },
    {
      type: "divider"
    },
  ];
  try {
    if (channel_name === 'directmessage') {
      await respond({
        response_type: 'ephemeral',
        replace_original: false,
        text: 'Message from Solace App',
        blocks: blocks
      });
    } else {
      await app.client.chat.postEphemeral({
        token: appSettings.BOT_TOKEN, // process.env.SLACK_BOT_TOKEN,
        channel: channel_id,
        user: user_id,
        "blocks": blocks,
        // Text in the notification
        text: 'Message from Solace App'
      });
    }
  } catch (error) {
    console.log('postAlreadyRegisteredMessage failed');
    console.log(error);
  }
}

const postRegisterMessage = async (payload, respond) => {
  const { app, appSettings, cache } = require('./app')
  const channel_id = payload?.channel_id ? payload?.channel_id : payload?.channel;
  const channel_name = payload?.channel_name ? payload?.channel_name : 'directmessage';
  const user_id = payload?.user_id ? payload?.user_id : payload?.user;

  let blocks = [
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
        text: ":boom: Hey there 👋 I'm SolaceBot. \n\nCould not process your request yet, sorry about that!\n\n"
                  + "I need you to register a valid API token to access Solace Event Portal. Go to "
                  + (payload.team_id ?
                      "<slack://app?team=" + payload.team_id + "&id=" + payload.api_app_id + "&tab=home|*Solace App Home*>  in the Apps list and register a token." :
                      "Apps list in the bottom of the sidebar on right, select Solace App and register a token")
      },
    },      
    {
      type: "divider"
    },
  ]

  try {
    if (channel_name === 'directmessage') {
      await app.client.chat.postEphemeral({
        token: appSettings.BOT_TOKEN, //process.env.SLACK_BOT_TOKEN,
        channel: channel_id,
        user: user_id,
        "blocks": blocks,
        text: 'Message from Solace App'
      });
    } else {
      await app.client.chat.postEphemeral({
        token: appSettings.BOT_TOKEN, //process.env.SLACK_BOT_TOKEN,
        channel: channel_id,
        user: user_id,
        "blocks": blocks,
        text: 'Message from Solace App'
      });
    }
  } catch (error) {
    console.log('postRegisterMessage failed');
    console.log(error);

    await respond({
      // response_type: 'ephemeral',
      replace_original: false,
      text: 'Message from Solace App',
      blocks: blocks
    });

  }
}

const quotes = ['\'', '"', '`', '’', '‘', "“", "”"];
const stripQuotes = (str) => {
  let begin = 0, end = str.length;
  if (quotes.includes(str.charAt(0)))
    begin = 1;
  if (quotes.includes(str.charAt(str.length-1)))
    end = str.length-1;

  return str.substring(begin, end);
}

const showHelp = async(channel_id, channel_name, user_id, respond) => {
  const { app, appSettings, cache } = require('./app')

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
    {
      "type": "section",
      "fields": [
        { 
          "type": "mrkdwn", 
          "text": "Get all application domains " 
        }, 
        {
          "type": "mrkdwn",
          "text": "`/solace domains`"
        },
        { 
          "type": "mrkdwn", 
          "text": "Get application domain by name " 
        }, 
        {
          "type": "mrkdwn",
          "text": '`/solace domains name:\"domain name\"`'
        },
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Examples"
          },
          action_id: "click_examples_domains"
        },
      ]
    },        
    {
      type: "divider"
    },
    {
      "type": "section",
      text: {
        type: "mrkdwn",
        "text": "*Applications*"
      },
    },
    {
      "type": "section",
      "fields": [
        { 
          "type": "mrkdwn", 
          "text": "Get applications " 
        }, 
        {
          "type": "mrkdwn",
          "text": "`/solace applications [domain:\"domain name\"] [sort:ASC|DESC]`"
        },
        { 
          "type": "mrkdwn", 
          "text": "Get application by name " 
        }, 
        {
          "type": "mrkdwn",
          "text": '`/solace applications name:\"application name\" [domain:\"domain name\"] `'
        },
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Examples"
          },
          action_id: "click_examples_applications"
        },
      ]
    },        
    {
      type: "divider"
    },
    {
      "type": "section",
      text: {
        type: "mrkdwn",
        "text": "*Events*"
      },
    },
    {
      "type": "section",
      "fields": [
        { 
          "type": "mrkdwn", 
          "text": "Get events " 
        }, 
        {
          "type": "mrkdwn",
          "text": "`/solace events [domain:\"domain name\"] [shared:true|false] [sort:ASC|DESC]`"
        },
        { 
          "type": "mrkdwn", 
          "text": "Get event by name " 
        }, 
        {
          "type": "mrkdwn",
          "text": '`/solace events name:\"event name\"`'
        },
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Examples"
          },
          action_id: "click_examples_events"
        },
      ]
    },        
    {
      type: "divider"
    },
    {
      "type": "section",
      text: {
        type: "mrkdwn",
        "text": "*Schemas*"
      },
    },
    {
      "type": "section",
      "fields": [
        { 
          "type": "mrkdwn", 
          "text": "Get schemas " 
        }, 
        {
          "type": "mrkdwn",
          "text": "`/solace schemas [domain:\"domain name\"] [shared:true|false] [sort:ASC|DESC]`"
        },
        { 
          "type": "mrkdwn", 
          "text": "Get schema by name " 
        }, 
        {
          "type": "mrkdwn",
          "text": '`/solace schemas name:\"schema name\"`'
        },
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Examples"
          },
          action_id: "click_examples_schemas"
        },
      ]
    },        
    {
      type: "divider"
    },

    {
      "type": "section",
      text: {
        type: "mrkdwn",
        "text": "*App Registration*"
      },
    },
    {
      "type": "section",
      "fields": [
        { 
          "type": "mrkdwn", 
          "text": "Register/Update API Token" 
        }, 
        {
          "type": "mrkdwn",
          "text": "`/solace register`"
        },
      ]
    },
    {
      type: "divider"
    },    

    {
      "type": "section",
      text: {
        type: "mrkdwn",
        "text": "*Miscellaneous*"
      },
    },
    {
      "type": "section",
      "fields": [
        { 
          "type": "mrkdwn", 
          "text": "Show examples" 
        }, 
        {
          "type": "mrkdwn",
          "text": "`/solace examples`"
        },
      ]
    },
    {
      type: "divider"
    },    
    {
      "type": "section",
      "fields": [
        { 
          "type": "mrkdwn", 
          "text": "Show help" 
        }, 
        {
          "type": "mrkdwn",
          "text": "`/solace help`"
        },
      ]
    },
    {
      type: "divider"
    },    
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "<https://github.com/SolaceLabs/solace-slack-app|*:book: Documentation*>",
        },
        {
          "type": "mrkdwn",
          "text": "<https://github.com/SolaceLabs/solace-slack-app/issues/new?title=Solace%20Integration%20for%20Slack%20-%20Feedback&body=%23%20Description%20of%20Bug/Enhancement|*:thought_balloon: Feedback*>",
        },
        {
          "type": "mrkdwn",
          "text": "<https://solace.community/|*:busts_in_silhouette: Community*>",
        },
      ]
    },    
    {
      type: "divider"
    },        
  ];

  try {
    if (channel_name === 'directmessage') {
      await respond({
        response_type: 'ephemeral',
        replace_original: false,
        text: 'Message from Solace App',
        blocks: blocks
      });
    } else {
      await app.client.chat.postEphemeral({
        token: appSettings.BOT_TOKEN, //process.env.SLACK_BOT_TOKEN,
        channel: channel_id,
        user: user_id,
        blocks,
        // Text in the notification
        text: 'Message from Solace App'
      });
    }
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
  }

  return;
}

const showExamples = async(channel_id, channel_name, user_id, actionId=null, respond) => {
  const { app, appSettings } = require('./app')

  let blocks = [];
  if (!actionId || actionId === 'click_examples_domains') {
    blocks.push(
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
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace domains`\n"
                  + "Get all application domains" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn",
          "text": '`/solace domains name:\"EP-Integration\"`\n'
                  + "Get application domain by name \"EP-Integration\" " 

        },
      },
      {
        type: "divider"
      });
  }
  if (!actionId || actionId === 'click_examples_applications') {
    blocks.push(
      {
        type: "divider"
      },
      {
        "type": "section",
        text: {
          type: "mrkdwn",
          "text": "*Applications*"
        },
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace applications`\n"
                  + "Get all applications" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace applications sort:ASC`\n"
                  + "Get all applications sorted by ascending order of application name" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace applications domain:\"EP-Integration\"`\n"
                  + "Get all applications in application domain \"EP-Integration\"" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn",
          "text": '`/solace applications name:\"EP-Integration-Application\"`\n'
                  + "Get application by name \"EP-Integration-Application\" " 

        },
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn",
          "text": '`/solace applications name:\"EP-Integration-Application\" domain:"EP-Integration"`\n'
                  + "Get application by name \"EP-Integration-Application\" in application domain \"EP-Integration\" " 

        },
      },
      {
        type: "divider"
      });
  }
  if (!actionId || actionId === 'click_examples_events') {
    blocks.push(
      {
        type: "divider"
      },
      {
        "type": "section",
        text: {
          type: "mrkdwn",
          "text": "*Events*"
        },
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace events`\n"
                  + "Get all events" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace events shared:true`\n"
                  + "Get all shared events" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace events sort:ASC`\n"
                  + "Get all events sorted by ascending order of event name" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace events shared:false domain:\"EP-Integration\"`\n"
                  + "Get all events that are not shared in application domain \"EP-Integration\"" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn",
          "text": '`/solace events name:\"EP-Integration-Event\"`\n'
                  + "Get event by name \"EP-Integration-Event\" " 

        },
      },
      {
        type: "divider"
      });
  }
  if (!actionId || actionId === 'click_examples_schemas') {
    blocks.push(
      {
        type: "divider"
      },
      {
        "type": "section",
        text: {
          type: "mrkdwn",
          "text": "*Schemas*"
        },
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace schemas`\n"
                  + "Get all schemas" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace schemas shared:true`\n"
                  + "Get all shared schemas" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace schemas shared:true sort:DESC`\n"
                  + "Get all shared schemas sorted by descending order of schema name" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace schemas domain:\"EP-Integration\"`\n"
                  + "Get all schemas in application domain \"EP-Integration\"" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn",
          "text": '`/solace schemas name:\"EP-Integration-Schema\"`\n'
                  + "Get schema by name \"EP-Integration-Schema\" " 

        },
      },
      {
        type: "divider"
      });
  }

  try {
    if (channel_name === 'directmessage' || channel_name.indexOf('mpdm-') === 0) {
      await respond({
        response_type: 'ephemeral',
        replace_original: false,
        text: 'Message from Solace App',
        blocks: blocks
      });
    } else {
      await app.client.chat.postEphemeral({
        token: appSettings.BOT_TOKEN, //process.env.SLACK_BOT_TOKEN,
        channel: channel_id,
        user: user_id,
        blocks,
        // Text in the notification
        text: 'Message from Solace App'
      });
    }
  } catch (error) {
    console.error(error);
  }
}



module.exports = { 
  postRegisterMessage,
  postAlreadyRegisteredMessage,
  checkArrayOfArrays,
  stripQuotes,
  showHelp,
  showExamples
};