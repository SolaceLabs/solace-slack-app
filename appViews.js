const JsonDB = require('node-json-db').JsonDB;
const db = new JsonDB('tokens', true, false);

const modalView = async ({ ack, body, respond, context, view }) => {
  console.log('view:modalView');
  ack();
  const { app, appSettings, cache } = require('./app')
  const appHome = require('./appHome');
  const ts = new Date();
  
  const data = {
    timestamp: ts.toLocaleString(),
    token: view.state.values.token.content.value,
    domain: view.state.values.domain.content.value,
    username: body.user.username,
    userid: body.user.id,
    teamid: body.user.team_id
  }

  try {
    db.reload();
    db.data[body.user.id] = data;
    db.save();
  } catch(error) {
    console.log(error);
  }

  const homeView = await appHome.createHome(body.user.id, data);
  let blocks = [
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
  ];

  try {
    await app.client.apiCall('views.publish', {
      token: appSettings.BOT_TOKEN, // process.env.SLACK_BOT_TOKEN,
      user_id: body.user.id,
      view: homeView
    });


    
  } catch(error) {
    console.log(error);
    app.error(error);
  }
    
}

module.exports = { 
  modalView,
};