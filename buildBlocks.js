const states = { 1: "Draft", 2: "Released", 3: "Deprecated", 4: "Retired" }

const constructErrorUnfurl = (error) => {
  let blocks = [
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Discover, Visualize and Catalog Your Event Streams With PubSub+ Event Portal*\n\n\n"
      },
    },
    {
      type: "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":boom: Hey there 👋 I'm SolaceBot. Could not process your request due to _`"
                  + error + "`_. Sorry about that!"
                  + "\n\n\nIt could be due to following reasons:"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*:one:* The link is not a valid Solace Event Portal link from domains _`solace-sso.solace.cloud`_ or _`console.solace.cloud`_"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*:two:* The link is from *v1.0 Event Portal*." 
                + " Ensure that the links are from a *v2.0* Event Portal.\n\n\n"
                + " :bulb: To enable *v2.0*, go to Event Portal *Home* and turn _*on*_ the *New Event Portal 2.0* option."
      }
    },
  ]

  return blocks;
}

const buildDomainBlocks = (results, domain) => {
  let blocks = [];
  
  for (let i = 0; i < results.length; i++) {
    let block = [];
    block = block.concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Domain [" + (i+1) + "]: * <https://" + domain + "/ep/designer/domains?selectedDomainId=" + results[i].id + "|" + results[i].name + ">",
        },
        accessory: {
          "action_id": "block_actions",
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "emoji": true,
            "text": "Manage"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Applications"
              },
              "value": "getdomainapplications|"+results[i].id+"|"+results[i].name
            },
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Events"
              },
              "value": "getdomainevents|"+results[i].id+"|"+results[i].name
            },
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Schemas"
              },
              "value": "getdomainschemas|"+results[i].id+"|"+results[i].name
            },
          ]
        }      
      }
    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: desc.join("\n")
          },
        }
      ]);
    }

    if (results[i].stats) {
      block = block.concat({
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": "_Application Count:_ " 
                            + "<https://" + domain + "/ep/designer/domains/" 
                            + results[i].id + "/applications?domainName=" + results[i].name 
                            + "|*" + results[i].stats.applicationCount + "*>",
          },
          {
            "type": "mrkdwn",
            "text": "_Event Count:_ " 
                            + "<https://" + domain + "/ep/designer/domains/" 
                            + results[i].id + "/events?domainName=" + results[i].name 
                            + "|*" + results[i].stats.eventCount + "*>",
          },
          {
            "type": "mrkdwn",
            "text": "_Schema Count:_ " 
                            + "<https://" + domain + "/ep/designer/domains/" 
                            + results[i].id + "/schemas?domainName=" + results[i].name 
                            + "|*" + results[i].stats.schemaCount + "*>",
          },
          {
            "type": "mrkdwn",
            "text": "_Enum Count:_ " 
                            + "<https://" + domain + "/ep/designer/domains/" 
                            + results[i].id + "/enums?domainName=" + results[i].name 
                            + "|*" + results[i].stats.enumCount + "*>",
          },
        ]
      });
    }

    block = block.concat([
      {
        type: "divider"
      }
    ]);
    blocks.push(block);
  }

  return blocks;
}

const buildApplicationBlocks = (results, domain) => {
  let blocks = [];
  for (let i = 0; i < results.length; i++) {
    let block = [];
    block = block.concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Application [" + (i+1) + "]: * <https://" + domain + "/ep/designer/domains/" + results[i].applicationDomainId 
                        + "/applications?selectedId=" + results[i].id + "|" + results[i].name + ">",
        },
        accessory: {
          "action_id": "block_actions",
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "emoji": true,
            "text": "Manage"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Versions"
              },
              "value": "getapplicationversions|"+results[i].id+"|"+results[i].name+"|"+results[i].applicationDomainId+"|"+results[i].domainName
            },
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Events"
              },
              "value": "getapplicationevents|"+results[i].id+"|"+results[i].name+"|"+results[i].applicationDomainId+"|"+results[i].domainName
            },
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Schemas"
              },
              "value": "getapplicationschemas|"+results[i].id+"|"+results[i].name+"|"+results[i].applicationDomainId+"|"+results[i].domainName
            },            
          ]
        }      
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Domain:* <https://" + domain + "/ep/designer/domains/"
                        + "?selectedDomainId=" + results[i].applicationDomainId + "|" + results[i].domainName + ">",
        },
      },
    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: desc.join("\n")
          },
        }
      ]);
    }

    block = block.concat({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_Number of versions:_ <https://" + domain + "/ep/designer/domains/" + results[i].applicationDomainId 
                      + "/applications/" + results[i].id
                      + "|" + results[i].numberOfVersions 
                      + ">"
        },      
        {
          "type": "mrkdwn",
          "text": "_Application Type:_ " + results[i].applicationType
        },      

      ]
    });

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    blocks.push(block);
  }

  return blocks;
}

const buildApplicationVersionBlocks = (results, domain) => {
  let blocks = [];
  for (let i = 0; i < results.length; i++) {
    let block = [];
    block = block.concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Application Version[" + (results[i].version) + "]: * <https://" + domain + "/ep/designer/domains/" + results[i].applicationDomainId 
                        + "/applications/" + results[i].applicationId 
                        + "?domainName=" + results[i].domainName 
                        + "&selectedId=" + results[i].id + "|" + results[i].displayName + ">",
        },
        accessory: {
          "action_id": "block_actions",
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "emoji": true,
            "text": "Manage"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Events"
              },
              "value": "getapplicationversionevents|"+results[i].id+"|"+results[i].name+"|"+results[i].applicationDomainId+"|"+results[i].domainName
            },
          ]
        }      
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Domain:* <https://" + domain + "/ep/designer/domains/"
                        + "?selectedDomainId=" + results[i].applicationDomainId + "|" + results[i].domainName + ">",
        },
      },
    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: desc.join("\n")
          },
        }
      ]);
    }

    if (results[i].producedEvents.length) {
      for (let j=0; j<results[i].producedEvents.length; j++) {
        console.log("Produced Event:", results[i].producedEvents[j])
        block = block.concat([
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Produced Events:*\n <https://" + domain + "/ep/designer/domains/" 
              + results[i].applicationDomainId  + "/events/" + results[i].producedEvents[j].id 
              + "|" + results[i].producedEvents[j].name  + ">"
            },
          }
        ]);
      }
    }

    if (results[i].consumedEvents.length) {
      for (let j=0; j<results[i].consumedEvents.length; j++) {
        console.log("Consumed Event:", results[i].consumedEvents[j])
        block = block.concat([
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Consumed Events:*\n <https://" + domain + "/ep/designer/domains/" 
              + results[i].applicationDomainId  + "/events/" + results[i].consumedEvents[j].id 
              + "|" + results[i].consumedEvents[j].name  + ">"
            },
          }
        ]);
      }
    }

    block = block.concat({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_State:_ " + states[results[i].stateId]
        },      
        {
          "type": "mrkdwn",
          "text": "_Produced Events Count:_ " + results[i].producedEvents.length
        },      
        {
          "type": "mrkdwn",
          "text": "_Consumed Events Count:_ " + results[i].consumedEvents.length
        },      
        {
          "type": "mrkdwn",
          "text": "_Consumers:_ " + results[i].consumers.length
        },      

      ]
    });

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    blocks.push(block);
  }

  return blocks;
}

const buildEventBlocks = (results, domain) => {
  let blocks = [];
  for (let i = 0; i < results.length; i++) {
    let block = [];
    block = block.concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Event:* <https://" + domain + "/ep/designer/domains/" 
                    + results[i].applicationDomainId  + "/events/" + results[i].id 
                    + "|" + results[i].name + ">"
        },
        accessory: {
          "action_id": "block_actions",
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "emoji": true,
            "text": "Manage"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Versions"
              },
              "value": "geteventversions|"+results[i].id+"|"+results[i].name+"|"+results[i].applicationDomainId+"|"+results[i].domainName
            },
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Schemas"
              },
              "value": "geteventschemas|"+results[i].id+"|"+results[i].name+"|"+results[i].applicationDomainId+"|"+results[i].domainName
            }
          ]
        }      
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Domain:* <https://" + domain + "/ep/designer/domains?selectedDomainId=" + results[i].applicationDomainId + "|" + results[i].domainName + ">"
        },
      },

    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: desc.join("\n")
          },
        }
      ]);
    }

    block = block.concat({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_Number of versions:_ <https://" + domain + "/ep/designer/domains/" + results[i].applicationDomainId 
                      + "/events/" + results[i].id
                      + "?domainName=" + results[i].domainName 
                      + "|" + results[i].numberOfVersions 
                      + ">"
        },      
        {
          "type": "mrkdwn",
          "text": "_Shared:_ " + results[i].shared
        },      

      ]
    });    


    block = block.concat([
      {
        type: "divider"
      }
    ]);

    blocks.push(block);
  }

  return blocks;
}

const buildEventVersionBlocks = (results, domain) => {
  let blocks = [];
  for (let i = 0; i < results.length; i++) {
    let block = [];
    block = block.concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Event:* <https://" + domain + "/ep/designer/domains/" 
                    + results[i].applicationDomainId  + "/events/" + results[i].eventId 
                    + "?selectedVersionId=" + results[i].id
                    + "|" + results[i].displayName + " (" + results[i].version + ")>"
        },
      },
    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: desc.join("\n")
          },
        }
      ]);
    }

    if (results[i].producingApps.length) {
      for (let j=0; j<results[i].producingApps.length; j++) {
        console.log("Producing Apps:", results[i].producingApps[j])
        block = block.concat([
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Producing Apps:*\n <https://" + domain + "/ep/designer/domains/" 
              + results[i].applicationDomainId  + "/applications/" + results[i].producingApps[j].applicationId 
              + "?domainName=" + results[i].domainName 
              + "&selectedId=" + results[i].producingApps[j].id 
              + "|" + results[i].producingApps[j].applicationName  + ">"
            },
          }
        ]);
      }
    }

    if (results[i].consumingApps.length) {
      for (let j=0; j<results[i].consumingApps.length; j++) {
        console.log("Producing Apps:", results[i].consumingApps[j])
        block = block.concat([
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Consuming Apps:*\n <https://" + domain + "/ep/designer/domains/" 
              + results[i].applicationDomainId  + "/applications/" + results[i].consumingApps[j].applicationId 
              + "?domainName=" + results[i].domainName 
              + "&selectedId=" + results[i].consumingApps[j].id 
              + "|" + results[i].consumingApps[j].applicationName  + ">"
            },
          }
        ]);
      }
    }

    console.log(results[i].producingApps, results[i].consumingApps);
    block = block.concat({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_State:_ " + states[results[i].stateId]
        },      
        {
          "type": "mrkdwn",
          "text": "_Producing Applications Count:_ " + results[i].producingApps.length
        },      
        {
          "type": "mrkdwn",
          "text": "_Consuming Applicationsts Count:_ " + results[i].consumingApps.length
        },      
      ]
    });    

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    blocks.push(block);
  }

  return blocks;
}

const buildSchemaBlocks = (results, domain, item) => {
  let blocks = [];
  
  for (let i = 0; i < results.length; i++) {
    let block = [];
    block = block.concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Schema:* <https://" + domain + "/ep/designer/domains/" 
                    + results[i].applicationDomainId  + "/schemas?selectedId=" + results[i].id 
                    + "|" + results[i].name + ">"
        },
        accessory: {
          "action_id": "block_actions",
          "type": "static_select",
          "placeholder": {
            "type": "plain_text",
            "emoji": true,
            "text": "Manage"
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Get Versions"
              },
              "value": "getschemaversions|"+results[i].id+"|"+results[i].name+"|"+results[i].applicationDomainId+"|"+results[i].domainName
            }
          ]
        }      
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Domain:* <https://" + domain + "/ep/designer/domains?selectedDomainId=" + results[i].applicationDomainId + "|" + results[i].domainName + ">"
        },
      },
    ]);

    if (results[i].description) {
      let desc = (results[i].description ? results[i].description.split(/\r?\n/) : "");
      desc.forEach((line, index) => desc[index] = ((line && line.length > 0) ? "_" + line + "_" : ""));
      block = block.concat([
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: desc.join("\n")
          },
        }
      ]);
    }

    block = block.concat({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_Number of versions:_ <https://" + domain + "/ep/designer/domains/" + results[i].applicationDomainId 
                      + "/schemas/" + results[i].id
                      + "?domainName=" + results[i].domainName 
                      + "|" + results[i].numberOfVersions 
                      + ">"
        },      
        {
          "type": "mrkdwn",
          "text": "_Shared:_ " + results[i].shared
        },      
        {
          "type": "mrkdwn",
          "text": "_Content Type:_ " + results[i].contentType
        },      
        {
          "type": "mrkdwn",
          "text": "_Schema Type:_ " + results[i].schemaType
        },      
        {
          "type": "mrkdwn",
          "text": "_Event Reference Count:_ " + results[i].eventVersionRefCount
        },      
      ]
    });    

    if (item && item.selectedVersionId) {
      block = block.concat({
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": "_Version:_ " + results[i].displayName + " (" + results[i].version + ")"
          },      
        ]
      });
    }

    block = block.concat([
      {
        type: "divider"
      }
    ]);

    blocks.push(block);
  }

  return blocks;
}

module.exports = { 
  constructErrorUnfurl,
  buildDomainBlocks,
  buildApplicationVersionBlocks,
  buildApplicationBlocks,
  buildEventBlocks,
  buildEventVersionBlocks,
  buildSchemaBlocks,
};