const EventPortal = require('./epwrapper')

const getSolaceApplicationDomains = async (mode, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();

  const ep = new EventPortal(solaceCloudToken.token);

  params.append('include', 'stats');
  if (mode === 'name') params.append('name', options.name);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);

  if (mode === 'all' || mode === 'name') {
    let result = await ep.getApplicationDomains(params);
    results = results.concat(result);
  } else if (mode === 'id') {
    let result = await ep.getApplicationDomainByID(options.id, params);
    results = results.concat(result);
  }

  return results;
}

const getSolaceApplications = async (mode, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  if (mode === 'name') params.append('name', options.name);
  if (options.hasOwnProperty('domainId')) params.append('applicationDomainId', options.domainId);
  if (options.hasOwnProperty('type')) params.append('applicationType', options.type);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);

  if (mode === 'all' || mode === 'name') {
    let result = await ep.getApplications(params);
    results = results.concat(result);
  } else if (mode === 'id') {
    let result = await ep.getApplicationByID(options.id, params);
    results = results.concat(result);
  }

  let domains = {};
  for (let i=0; i<results.length; i++) {
    if (!domains[results[i].applicationDomainId])
      domains[results[i].applicationDomainId] = await ep.getApplicationDomainName(results[i].applicationDomainId);
    results[i].domainName = domains[results[i].applicationDomainId];
  }

  return results;
}

const getSolaceApplicationVersions = async (applicationId, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  // params.append('id', applicationId);

  let result = await ep.getApplicationVersions(applicationId, params);
  results = results.concat(result);

  for (let i=0; i<results.length; i++) {
    results[i].applicationDomainId = options?.applicationDomainId;
    results[i].domainName = options?.domainName;
  }

  let events = {};
  for (let i=0; i<results.length; i++) {
    results[i].producedEvents = [];
    results[i].producedEvents.length = results[i].declaredProducedEventVersionIds.length
    results[i].consumedEvents = [];
    results[i].consumedEvents.length = results[i].declaredConsumedEventVersionIds.length
    
    for (let j=0; j<results[i].declaredProducedEventVersionIds.length; j++) {
      if (!events[results[i].declaredProducedEventVersionIds[j]]) {
        let eventVersion = await ep.getEventVersionByID(results[i].declaredProducedEventVersionIds[j]);
        console.log(eventVersion);
        events[results[i].declaredProducedEventVersionIds[j]] = await ep.getEventByID(eventVersion.eventId);
      }

      results[i].producedEvents[j] = events[results[i].declaredProducedEventVersionIds[j]];
    }
    for (let j=0; j<results[i].declaredConsumedEventVersionIds.length; j++) {
      if (!events[results[i].declaredConsumedEventVersionIds[j]]) {
        let eventVersion = await ep.getEventVersionByID(results[i].declaredConsumedEventVersionIds[j]);
        console.log(eventVersion);
        events[results[i].declaredConsumedEventVersionIds[j]] = await ep.getEventByID(eventVersion.eventId);
      }
      results[i].consumedEvents[j] = events[results[i].declaredConsumedEventVersionIds[j]];
    }
  }
  return results;
}

const getSolaceApplicationEvents = async (applicationId, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  // params.append('id', applicationId);

  let result = await ep.getApplicationVersions(applicationId, params);
  results = results.concat(result);

  for (let i=0; i<results.length; i++) {
    results[i].applicationDomainId = options?.applicationDomainId;
    results[i].domainName = options?.domainName;
  }

  let events = {};
  for (let i=0; i<results.length; i++) {
    results[i].producedEvents = [];
    results[i].producedEvents.length = results[i].declaredProducedEventVersionIds.length
    results[i].consumedEvents = [];
    results[i].consumedEvents.length = results[i].declaredConsumedEventVersionIds.length
    
    for (let j=0; j<results[i].declaredProducedEventVersionIds.length; j++) {
      if (!events[results[i].declaredProducedEventVersionIds[j]]) {
        let eventVersion = await ep.getEventVersionByID(results[i].declaredProducedEventVersionIds[j]);
        events[results[i].declaredProducedEventVersionIds[j]] = await ep.getEventByID(eventVersion.eventId);
      }

      results[i].producedEvents[j] = events[results[i].declaredProducedEventVersionIds[j]];
    }
    for (let j=0; j<results[i].declaredConsumedEventVersionIds.length; j++) {
      if (!events[results[i].declaredConsumedEventVersionIds[j]]) {
        let eventVersion = await ep.getEventVersionByID(results[i].declaredConsumedEventVersionIds[j]);
        events[results[i].declaredConsumedEventVersionIds[j]] = await ep.getEventByID(eventVersion.eventId);
      }
      results[i].consumedEvents[j] = events[results[i].declaredConsumedEventVersionIds[j]];
    }
  }

  let domains = {};
  let keys = Object.keys(events);
  for (let i=0; i<keys.length; i++) {
    if (!domains[events[keys[i]].applicationDomainId])
      domains[events[keys[i]].applicationDomainId] = await ep.getApplicationDomainName(events[keys[i]].applicationDomainId);
    events[keys[i]].domainName = domains[events[keys[i]].applicationDomainId]
  }

  return Object.values(events);
}

const getSolaceApplicationSchemas = async (applicationId, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  console.log('Options', options);

  let result = await ep.getApplicationVersions(applicationId, params);
  results = results.concat(result);

  for (let i=0; i<results.length; i++) {
    results[i].applicationDomainId = options?.applicationDomainId;
    results[i].domainName = options?.domainName;
  }

  let schemas = {};
  let events = {};
  for (let i=0; i<results.length; i++) {    
    for (let j=0; j<results[i].declaredProducedEventVersionIds.length; j++) {
      if (!events[results[i].declaredProducedEventVersionIds[j]]) {
        let eventVersion = await ep.getEventVersionByID(results[i].declaredProducedEventVersionIds[j]);
        events[results[i].declaredProducedEventVersionIds[j]] = eventVersion;
        if (eventVersion.schemaVersionId && !schemas[eventVersion.schemaVersionId]) {
          let schemaVersion = await ep.getSchemaVersionByID(eventVersion.schemaVersionId);
          schemas[schemaVersion.schemaId] = await ep.getSchemaByID(schemaVersion.schemaId);
          schemas[schemaVersion.schemaId].applicationDomainId = options?.applicationDomainId;
          schemas[schemaVersion.schemaId].domainName = options?.domainName;
        }
      }
    }
    for (let j=0; j<results[i].declaredConsumedEventVersionIds.length; j++) {
      if (!events[results[i].declaredConsumedEventVersionIds[j]]) {
        let eventVersion = await ep.getEventVersionByID(results[i].declaredConsumedEventVersionIds[j]);
        events[results[i].declaredConsumedEventVersionIds[j]] = eventVersion;
        if (eventVersion.schemaVersionId && !schemas[eventVersion.schemaVersionId]) {
          let schemaVersion = await ep.getSchemaVersionByID(eventVersion.schemaVersionId);
          schemas[schemaVersion.schemaId] = await ep.getSchemaByID(schemaVersion.schemaId);
          schemas[schemaVersion.schemaId].applicationDomainId = options?.applicationDomainId;
          schemas[schemaVersion.schemaId].domainName = options?.domainName;
        }
      }
    }
  }

  return Object.values(schemas);
}

const getSolaceEvents = async (mode, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();

  const ep = new EventPortal(solaceCloudToken.token);

  if (mode === 'name') params.append('name', options.name);
  if (options.hasOwnProperty('domainId')) params.append('applicationDomainId', options.domainId);
  if (options.hasOwnProperty('shared')) params.append('shared', options.shared);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);

  if (mode === 'all' || mode === 'name') {
    let result = await ep.getEvents(params);
    results = results.concat(result);
  } else if (mode === 'id') {
    let result = await ep.getEventByID(options.id, params);
    results = results.concat(result);
  }

  let domains = {};
  for (let i=0; i<results.length; i++) {
    if (!domains[results[i].applicationDomainId])
      domains[results[i].applicationDomainId] = await ep.getApplicationDomainName(results[i].applicationDomainId);
    results[i].domainName = domains[results[i].applicationDomainId];
  }

  return results;
}

const getSolaceEventVersions = async (eventId, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  // params.append('id', applicationId);

  let result = await ep.getEventVersions(eventId, params);
  results = results.concat(result);

  for (let i=0; i<results.length; i++) {
    results[i].applicationDomainId = options?.applicationDomainId;
    results[i].domainName = options?.domainName;
  }
  let schemas = {};
  for (let i=0; i<results.length; i++) {    
    if (results[i].schemaVersionId && !schemas[results[i].schemaVersionId]) {
      let schemaVersion = await ep.getSchemaVersionByID(results[i].schemaVersionId);
      schemas[results[i].schemaVersionId] = await ep.getSchemaByID(schemaVersion.schemaId);
    }

    results[i].schema = schemas[results[i].schemaVersionId];
  }

  let appVersions = {};
  let apps = {};
  for (let i=0; i<results.length; i++) {
    results[i].producingApps = [];
    results[i].producingApps.length = results[i].declaredProducingApplicationVersionIds.length
    results[i].consumingApps = [];
    results[i].consumingApps.length = results[i].declaredConsumingApplicationVersionIds.length
    
    for (let j=0; j<results[i].declaredProducingApplicationVersionIds.length; j++) {
      if (!appVersions[results[i].declaredProducingApplicationVersionIds[j]]) {
        let appVersion = await ep.getApplicationVersionByID(results[i].declaredProducingApplicationVersionIds[j]);
        console.log(appVersion);
        appVersions[results[i].declaredProducingApplicationVersionIds[j]] = appVersion;
        if (!apps[appVersion.applicationId]) {
          let app = await ep.getApplicationByID(appVersion.applicationId);
          console.log(app);
          apps[appVersion.applicationId] = app;
        }
        appVersions[results[i].declaredProducingApplicationVersionIds[j]].applicationName = apps[appVersion.applicationId].name;
      }

      results[i].producingApps[j] = appVersions[results[i].declaredProducingApplicationVersionIds[j]];
    }
    for (let j=0; j<results[i].declaredConsumingApplicationVersionIds.length; j++) {
      if (!appVersions[results[i].declaredConsumingApplicationVersionIds[j]]) {
        let appVersion = await ep.getApplicationVersionByID(results[i].declaredConsumingApplicationVersionIds[j]);
        console.log(appVersion);
        appVersions[results[i].declaredConsumingApplicationVersionIds[j]] = appVersion;
        if (!apps[appVersion.applicationId]) {
          let app = await ep.getApplicationByID(appVersion.applicationId);
          console.log(app);
          apps[appVersion.applicationId] = app;
        }
        appVersions[results[i].declaredProducingApplicationVersionIds[j]].applicationName = apps[appVersion.applicationId].name;
      }

      results[i].consumingApps[j] = appVersions[results[i].declaredConsumingApplicationVersionIds[j]];
    }
  }

  return results;
}

const getSolaceSchemas = async (mode, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();

  const ep = new EventPortal(solaceCloudToken.token);

  if (mode === 'name') params.append('name', options.name);
  if (options.hasOwnProperty('domainId')) params.append('applicationDomainId', options.domainId);
  if (options.hasOwnProperty('shared')) params.append('shared', options.shared);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);

  if (mode === 'all' || mode === 'name') {
    let result = await ep.getSchemas(params);
    results = results.concat(result);
  } else if (mode === 'id') {
    let result = await ep.getSchemaByID(options.id, params);
    results = results.concat(result);
  }

  let domains = {};
  for (let i=0; i<results.length; i++) {
    if (!domains[results[i].applicationDomainId])
      domains[results[i].applicationDomainId] = await ep.getApplicationDomainName(results[i].applicationDomainId);
    results[i].domainName = domains[results[i].applicationDomainId];
  }

  console.log('EVENTS', results);
  return results;
}

const getApplicationDomainId = async (domainName, solaceCloudToken) => {
  console.log('I am here...');
  const ep = new EventPortal(solaceCloudToken.token);

  try {
    console.log('Get Id for name: ' + domainName);
    let id = await ep.getApplicationDomainID(domainName);
    console.log('Got Id for name: ' + domainName + ' :: ' + id);
    return id;
  } catch (error) {
    console.log('getApplicationDomainId Error: ', error);
    return null;
  }
}

module.exports = {
  getSolaceApplicationDomains,
  getSolaceApplications,
  getSolaceApplicationVersions,
  getSolaceApplicationEvents,
  getSolaceApplicationSchemas,
  getSolaceEvents,
  getSolaceEventVersions,
  getSolaceSchemas,
  getApplicationDomainId
}