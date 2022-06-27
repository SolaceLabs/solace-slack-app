const checkArrayOfArrays = (a) => {
  return a.every(function(x){ return Array.isArray(x); });
}

const postAlreadyRegisteredMessage = async (channel, user) => {
  const { app } = require('./app')
  
  try {
    await app.client.chat.postEphemeral({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channel,
      user: user,
      "blocks": [
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: ":thumbsup: *You have already registered, you're all set!*\n\n"
          },
        },
        {
          type: "divider"
        },
      ],
      // Text in the notification
      text: 'Message from Solace App'
    });
  } catch (error) {
    console.log('postAlreadyRegisteredMessage failed');
    console.log(error);
  }
}

const postRegisterMessage = async (channel, user) => {
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
          text: ":boom: Hey there 👋 I'm SolaceBot. \n\nCould not process your request yet, sorry about that!\n\n"
                + "I need you to register a valid API Token to access Solace Event Portal.\n"
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
      },
      {
        type: "divider"
      },
    ]

    await app.client.chat.postEphemeral({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channel,
      user: user,
      "blocks": blocks,
      text: 'Message from Solace App'
    });

  } catch (error) {
    console.log('postRegisterMessage failed');
    console.log(error);
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

const showHelp = async(userId, channelId) => {
  const { app } = require('./app')

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
          "text": "Get application domains " 
        }, 
        {
          "type": "mrkdwn",
          "text": "`/solace domain`"
        },
        { 
          "type": "mrkdwn", 
          "text": "Get application domain by name " 
        }, 
        {
          "type": "mrkdwn",
          "text": '`/solace domain name:\"domain name\"`'
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
          "text": "`/solace application [domain:\"domain name\"] [sort:ASC|DESC]`"
        },
        { 
          "type": "mrkdwn", 
          "text": "Get application by name " 
        }, 
        {
          "type": "mrkdwn",
          "text": '`/solace application name:\"application name\" [domain:\"domain name\"] `'
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
          "text": "`/solace event [domain:\"domain name\"] [shared:true|false] [sort:ASC|DESC]`"
        },
        { 
          "type": "mrkdwn", 
          "text": "Get event by name " 
        }, 
        {
          "type": "mrkdwn",
          "text": '`/solace event name:\"event name\"`'
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
          "text": "`/solace schema [domain:\"domain name\"] [shared:true|false] [sort:ASC|DESC]`"
        },
        { 
          "type": "mrkdwn", 
          "text": "Get schema by name " 
        }, 
        {
          "type": "mrkdwn",
          "text": '`/solace schema name:\"schema name\"`'
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
      "fields": [
        { 
          "type": "mrkdwn", 
          "text": "Search Event Portal resource" 
        }, 
        {
          "type": "mrkdwn",
          "text": "`/solace search`"
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
        "text": "*More*"
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: ":book: Documentation",
          },
          url: "https://github.com/gvensan/solace-slackapp"
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: ":thought_balloon: Feedback"
          },
          url: "https://github.com/gvensan/solace-slackapp/issues/new"
        },
      ]
    },
    {
      type: "divider"
    },        
  ];

  try {
    await app.client.chat.postEphemeral({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelId,
      user: userId,
      blocks,
      // Text in the notification
      text: 'Message from Solace App'
    });
  } catch (error) {
    console.error(error);
  }

  return;
}

const showExamples = async(userId, channelId, actionId=null) => {
  const { app } = require('./app')

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
          "text": "`/solace domain`\n"
                  + "Get all application domains" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn",
          "text": '`/solace domain name:\"EP-Integration\"`\n'
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
          "text": "`/solace application`\n"
                  + "Get all applications" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace application sort:ASC`\n"
                  + "Get all applications sorted by ascending order of application name" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace application domain:\"EP-Integration\"`\n"
                  + "Get all applications in domain \"EP-Integration\"" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn",
          "text": '`/solace application name:\"EP-Integration-App\"`\n'
                  + "Get application by name \"EP-Integration-App\" " 

        },
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn",
          "text": '`/solace application name:\"EP-Integration-App\" domain:"EP-Integration"`\n'
                  + "Get application by name \"EP-Integration-App\" in domain \"EP-Integraion\" " 

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
          "text": "`/solace event`\n"
                  + "Get all events" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace event shared:true`\n"
                  + "Get all shared events" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace event sort:ASC`\n"
                  + "Get all events sorted by ascending order of event name" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace event domain:\"EP-Integration\"`\n"
                  + "Get all events in domain \"EP-Integration\"" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn",
          "text": '`/solace event name:\"EP-Integration-Event\"`\n'
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
          "text": "`/solace schema`\n"
                  + "Get all schemas" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace schema shared:true`\n"
                  + "Get all shared schemas" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace schema sort:ASC`\n"
                  + "Get all schemas sorted by ascending order of schema name" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn", 
          "text": "`/solace schema domain:\"EP-Integration\"`\n"
                  + "Get all schemas in domain \"EP-Integration\"" 
        }, 
      },
      {
        "type": "section",
        text: {
          "type": "mrkdwn",
          "text": '`/solace schema name:\"EP-Integration-Schemas\"`\n'
                  + "Get schema by name \"EP-Integration-Schema\" " 

        },
      },
      {
        type: "divider"
      });
  }

  try {
    await app.client.chat.postEphemeral({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelId,
      user: userId,
      blocks,
      // Text in the notification
      text: 'Message from Solace App'
    });
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