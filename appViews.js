const JsonDB = require('node-json-db').JsonDB;
const db = new JsonDB('tokens', true, false);

const modalView = async ({ ack, body, context, view }) => {
  console.log('view:modalView');
  ack();

  const { app, cache } = require('./app')
  const appHome = require('./appHome');
  const ts = new Date();
  
  const data = {
    timestamp: ts.toLocaleString(),
    token: view.state.values.token.content.value,
    domain: view.state.values.domain.content.value,
    username: body.user.username,
    userid: body.user.id
  }

  try {
    let solaceCloudToken = db.getData(`/${body.user.id}/data`);
    solaceCloudToken[body.user.id] = data;
    db.save();
  } catch(error) {
    // ignore
  }

  const homeView = await appHome.createHome(body.user.id, data);

  try {
    let channelId = cache.get('channelId');
    if (channelId) {
      await app.client.chat.postEphemeral({
        token: process.env.SLACK_BOT_TOKEN,
        user: body.user.id,
        channel: channelId,
        "blocks": [
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: ":thumbsup: *Registration successful!*\n\n"
            },
          },
          {
            type: "divider"
          },
        ],
        // Text in the notification
        text: 'Message from Solace App'
      });
    }
    
    await app.client.apiCall('views.publish', {
      token: process.env.SLACK_BOT_TOKEN,
      user_id: body.user.id,
      view: homeView
    });

  } catch(e) {
    console.log(e);
    app.error(e);
  }
    
}

module.exports = { 
  modalView,
};