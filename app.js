const { App, LogLevel } = require("@slack/bolt");
const { echoSlashCommand, solaceSlashCommand } = require('./appCommand');
const { appHomeOpenedEvent, appLinkSharedEvent } = require('./appEvent');
const { helloMessage } = require('./appMessage');
const { fetchDependentResources, authorizeEPTokenAction, modifyEPTokenAction, getMoreResources, showHelpAction, showExamplesAction } = require('./appActions');
const { modalView } = require('./appViews');

const JsonDB = require('node-json-db').JsonDB;
const orgDB = new JsonDB('orgInstalls', true, false);
const workspaceDB = new JsonDB('workspaceInstalls', true, false);

const NodeCache = require( "node-cache" );
const cache = new NodeCache();
require("dotenv").config();

const { customRoutes } = require('./customRoutes');

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
          const install = orgDB.getData(`/${data.enterprise.id}/data`);
          install[data.team.id] = data;
        } catch (error) {
          console.log('storeInstallation - Enterprise ' + data.enterprise.id + ' not found, registering');
          orgDB.push(`/${data.enterprise.id}/data`, data, true);
        }
        orgDB.save();
        return;
      }
      if (data.team !== undefined) {
        workspaceDB.reload();
        try {
          const installs = workspaceDB.getData(`/${data.team.id}/data`);
          installs[data.team.id] = data;
        } catch (error) {
          console.log('storeInstallation - Workspace ' + data.team.id + ' not found, registering');
          workspaceDB.push(`/${data.team.id}/data`, data, true);
        }
        workspaceDB.save();
        return;
      }
    },
    fetchInstallation: async (installQuery) => {
      console.log('fetchInstallation', installQuery);
      try {
        if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
          orgDB.reload();
          const install = orgDB.getData(`/${installQuery.enterpriseId}/data`);
          return install;
        }
        if (installQuery.teamId !== undefined) {
          workspaceDB.reload();
          const install = workspaceDB.getData(`/${installQuery.teamId}/data`);
          return install;
        }
      } catch (error) {
        console.log("Failed fetching installation", error);
        throw new Error("Authorization failed");
      }
    },
    deleteInstallation: async (installQuery) => {
      console.log('deleteInstallation', installQuery);
      try {
        if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined ) {
          orgDB.reload();
          orgDB.delete(`/${installQuery.enterpriseId}`);
          return;
        }
        if (installQuery.teamId !== undefined) {
          workspaceDB.reload();
          workspaceDB.delete(`/${installQuery.teamId}`);
          return;
        }
      } catch (error) {
        console.log("Failed deleting installation", error);
        // ignore
      }
    }
  },
});

app.command('/echo', echoSlashCommand);
app.command('/solace', solaceSlashCommand);

app.event('app_home_opened', appHomeOpenedEvent);
app.event('link_shared', appLinkSharedEvent);

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

module.exports = { app, cache };