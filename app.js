const { App, LogLevel } = require("@slack/bolt");
const { echoSlashCommand, solaceSlashCommand } = require('./appCommand');
const { appHomeOpenedEvent, appUninstalledEvent, appLinkSharedEvent } = require('./appEvent');
const { helloMessage } = require('./appMessage');
const { fetchDependentResources, authorizeEPTokenAction, modifyEPTokenAction, 
        getMoreResources, showHelpAction, showExamplesAction } = require('./appActions');
const { modalView } = require('./appViews');

const JsonDB = require('node-json-db').JsonDB;
const orgDB = new JsonDB('orgInstalls', true, false);
const workspaceDB = new JsonDB('workspaceInstalls', true, false);

const NodeCache = require( "node-cache" );
const cache = new NodeCache();
require("dotenv").config();

const { customRoutes } = require('./customRoutes');

const appSettings = {
  BOT_TOKEN: process.env.BOT_TOKEN,
};

// Initializes your app with your bot token and signing secret
const app = new App({
  logLevel: LogLevel.DEBUG,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'solace-slack-integration',
  customRoutes: customRoutes,
  // appToken: process.env.SLACK_APP_TOKEN,
  // token: process.env.SLACK_BOT_TOKEN,
  scopes: [ 'app_mentions:read','channels:history','channels:read','chat:write','commands','groups:history','im:history','links:read','links:write','mpim:history','mpim:read','mpim:write' ],
  installerOptions: {
    stateVerification: false,
  },
  installationStore: {
    storeInstallation: async (data) => {
      console.log('storeInstallation', data);
      if ( data.isEnterpriseInstall && data.enterprise !== undefined ) {
        orgDB.reload();
        try {
          const found = Object.entries(orgDB.data).find(entry => { return entry[0] === data.enterprise.id; });
          if (!found)
            orgDB.data[data.team.id] = data;
        } catch (error) {
          console.log('storeInstallation - Error while registering enterprise ' + data.enterprise.id);
        }
        orgDB.save();
        return;
      } else if (data.team !== undefined) {
        workspaceDB.reload();
        try {
          const found = Object.entries(workspaceDB.data).find(entry => { return entry[0] === data.team.id; });
          if (!found)
            workspaceDB.data[data.team.id] = data;
        } catch (error) {
          console.log('storeInstallation - Error while registering Workspace ' + data.team.id);
        }
        workspaceDB.save();
        return;
      }
    },
    fetchInstallation: async (installQuery) => {
      console.log('fetchInstallation', installQuery);
      let found = false;
      try {
        if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
          orgDB.reload();
          found = Object.entries(orgDB.data).find(entry => { return entry[0] === installQuery.enterpriseId; });
          if (found)
            appSettings.BOT_TOKEN = found[1].bot.token;
        } else if (installQuery.teamId !== undefined) {
          workspaceDB.reload();
          found = Object.entries(workspaceDB.data).find(entry => { return entry[0] === installQuery.teamId; });
          if (found)
            appSettings.BOT_TOKEN = found[1].bot.token;
        }
      } catch (error) {
        console.log("Failed fetching installation", error);
        throw new Error("Authorization failed");
      }

      if (!found) {
        console.log("Could not find installation");
        throw new Error("Authorization failed");
      }

      return found[1];
    },
    deleteInstallation: async (installQuery) => {
      console.log('deleteInstallation', installQuery);
      try {
        if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined ) {
          orgDB.reload();
          validEnterprises = Object.entries(orgDB.data).filter(entry => { 
                                return entry[0] !== installQuery.enterpriseId;
                              });
          orgDB.data = {};
          validEnterprises.forEach(entry => {
            orgDB.data[entry[0]] = entry[1];
          })

          orgDB.save();
          return;
        }
        if (installQuery.teamId !== undefined) {
          workspaceDB.reload();
          validWorkspaces = Object.entries(workspaceDB.data).filter(entry => { 
                                return entry[0] !== installQuery.teamId;
                              });
          workspaceDB.data = {};
          validWorkspaces.forEach(entry => {
            workspaceDB.data[entry[0]] = entry[1];
          })

          workspaceDB.save();
          return;
        }
      } catch (error) {
        console.log("Failed deleting installation", error);
      }
    }
  },
});

app.command('/echo', echoSlashCommand);
app.command('/solace', solaceSlashCommand);

app.event('app_home_opened', appHomeOpenedEvent);
app.event('link_shared', appLinkSharedEvent);
app.event('tokens_revoked', appUninstalledEvent);

app.message('hello', helloMessage);

app.action('block_actions', fetchDependentResources);
app.action('click_authorize', authorizeEPTokenAction);
app.action('click_show_help', showHelpAction);
app.action('click_get_more', getMoreResources);

app.action('click_examples_domains', showExamplesAction);
app.action('click_examples_applications', showExamplesAction);
app.action('click_examples_events', showExamplesAction);
app.action('click_examples_schemas', showExamplesAction);

app.action('add_token', modifyEPTokenAction);

app.view('modal_view', modalView);

(async () => {
  // Start your app
  await app.start(process.env.PORT || 4000);
  cache.set('started', true);
  console.log('⚡️ Bolt app is running!');
})();

module.exports = { app, appSettings, cache };