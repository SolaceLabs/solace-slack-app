const JsonDB = require('node-json-db').JsonDB;
const db = new JsonDB('tokens', true, false);

const updateView = async(user) => {
  console.log('updateView');

  let solaceCloudToken = undefined;
  try {
    db.reload();
    solaceCloudToken = db.getData(`/${user}/data`);
  } catch(error) {
    console.error(error); 
  }

  let blocks = [ 
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Welcome <@" + user + "> to Solace Slack App :house:*"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Here you can manage Solace's Cloud REST API Token."
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Solace's Cloud REST API Token*"
      },
      accessory: {
        type: "button",
        action_id: "add_token", 
        text: {
          type: "plain_text",
          text: solaceCloudToken ? "Update Token" : "Register Token",
          emoji: true,
        }
      }
    },
    {
      type: "divider"
    },
  ];

  if (solaceCloudToken) {
    blocks = blocks.concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*API Token*: " + solaceCloudToken.token,
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
          text: "*Event Portal Domain*:\n" + solaceCloudToken.domain,
        },
      },      
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
            type: "mrkdwn",
            text: solaceCloudToken.username + " (" + solaceCloudToken.userid + ")\n" + solaceCloudToken.timestamp
        },
      },
      {
        type: "divider"
      },
    ]);
  } else {
    blocks = blocks.concat([
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          text: ":boom: Hey there 👋 \n\n"
                    + "I need you to register a valid API Token to access Solace Event Portal. "
                    + "It just takes a second, and then you'll be all set. "
                    + "Just click on `Register Token` button above."
        }
      },
      {
        type: "divider"
      }
    ]);
  }
    
  // The final view -
  
  let view = {
    type: 'home',
    callback_id: 'home_view',
    title: {
      type: 'plain_text',
      text: 'Solace Event Portal!'
    },
    blocks: blocks
  }
  
  return JSON.stringify(view);
};

/* Display App Home */
const createHome = async(user, data) => {  
  console.log('createHome');
  if(data) {     
    // Store in a local DB
    db.push(`/${user}/data`, data, true);   
  }
  
  const userView = await updateView(user);
  
  return userView;
};

/* Open a modal */

const openModal = (token) => {
  console.log('openModal');

  const modal = {
    type: 'modal',
    callback_id: 'modal_view',
    title: {
      type: 'plain_text',
      text: 'API Token'
    },
    submit: {
      type: 'plain_text',
      text: 'Register',
    },
    blocks: [
      {
        type: "input",
        "block_id": "token",
        "label": {
          type: "plain_text",
          text: "Solace Cloud REST API Token"
        },
        "element": {
          "action_id": "content",
          type: "plain_text_input",
          "placeholder": {
            type: "plain_text",
            text: "API Token..."
          },
          "initial_value": token ? token.token : "",
          "multiline": true
        }
      },
      {
        "type": "input",
        "block_id": "domain",
        "label": {
          "type": "plain_text",
          "text": "Solace Event Portal URL Domain",
          "emoji": true
        },
        "element": {
          "type": "plain_text_input",
          "action_id": "content",
          "placeholder": {
            "type": "plain_text",
            "text": "Enter a valid domain name..",
            "emoji": true,
          },
          "initial_value": token ? token.domain : "",
        }
      },
    ]
  };
  
  return modal;
};


module.exports = { createHome, openModal, updateView };