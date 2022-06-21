const JsonDB = require('node-json-db').JsonDB;
const db = new JsonDB('tokens', true, false);

const updateView = async(user) => {
  console.log('updateView');

  let token = null;
  
  try {
    token = db.getData(`/${user}/data`);
  } catch(error) {
    // console.error(error); 
  };

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
          text: token ? "Update Token" : "Add Token",
          emoji: true
        }
      }
    },
    {
      type: "divider"
    },
  ];

  if (token) {
    blocks = blocks.concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*API Token*: " + token.token,
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
          text: "*Event Portal Domain*:\n" + token.domain,
        },
      },      
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
            type: "mrkdwn",
            text: token.username + " (" + token.userid + ")\n" + token.timestamp
        },
      },
      {
        type: "divider"
      },
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

const openModal = () => {
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
      text: 'Register'
    },
    blocks: [
      {
        type: "input",
        "block_id": "token",
        "label": {
          type: "plain_text",
          text: "Solace Cloud REST Token"
        },
        "element": {
          "action_id": "content",
          type: "plain_text_input",
          "placeholder": {
            type: "plain_text",
            text: "API Token..."
          },
          "multiline": true
        }
      },
      {
        "type": "input",
        "block_id": "domain",
        "label": {
          "type": "plain_text",
          "text": "Solace Event Portal Domain name",
          "emoji": true
        },
        "element": {
          "type": "static_select",
          "action_id": "content",
          "placeholder": {
            "type": "plain_text",
            "text": "Choose the domain..",
            "emoji": true
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "text": "solace-sso.solace.cloud",
                "emoji": true
              },
              "value": "solace-sso.solace.cloud"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "console.solace.cloud",
                "emoji": true
              },
              "value": "console.solace.cloud"
            },
          ]
        }
      },      
    ]
  };
  
  return modal;
};


module.exports = { createHome, openModal, updateView };