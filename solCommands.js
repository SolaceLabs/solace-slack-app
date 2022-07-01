const EventPortal = require('./epwrapper')

const getSolaceApplicationDomains = async (mode, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();

  const ep = new EventPortal(solaceCloudToken.token);

  params.append('include', 'stats');
  if (mode === 'name') params.append('name', options.name);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);
  if (options.hasOwnProperty('pageSize')) params.append('pageSize', options.pageSize);
  if (options.hasOwnProperty('pageNumber')) params.append('pageNumber', options.pageNumber);
  
  let response = undefined;
  if (mode === 'all' || mode === 'name')
    response = await ep.getApplicationDomains(params);
  else if (mode === 'id')
    response = await ep.getApplicationDomainByID(options.id, params);
  results = {data: results.concat(response.data), meta: response.meta};

  return results;
}

const getSolaceApplications = async (mode, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  if (mode === 'name') params.append('name', encodeURIComponent(options.name));
  if (options.hasOwnProperty('domainId')) params.append('applicationDomainId', options.domainId);
  if (options.hasOwnProperty('type')) params.append('applicationType', options.type);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);
  if (options.hasOwnProperty('pageSize')) params.append('pageSize', options.pageSize);
  if (options.hasOwnProperty('pageNumber')) params.append('pageNumber', options.pageNumber);

  let response = undefined;
  if (mode === 'all' || mode === 'name')
    response = await ep.getApplications(params);
  else if (mode === 'id')
    response = await ep.getApplicationByID(options.id, params);
  results = {data: results.concat(response.data), meta: response.meta};

  let domains = {};
  for (let i=0; i<results.data.length; i++) {
    if (!domains[results.data[i].applicationDomainId])
      domains[results.data[i].applicationDomainId] = await ep.getApplicationDomainName(results.data[i].applicationDomainId);
    results.data[i].domainId = results.data[i].applicationDomainId;
    results.data[i].domainName = domains[results.data[i].applicationDomainId];
  }

  return results;
}

const getSolaceApplicationVersions = async (applicationId, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  // params.append('id', applicationId);

  let result = undefined;
  if (options.hasOwnProperty('domainId')) params.append('applicationDomainId', options.domainId);
  if (options.hasOwnProperty('shared')) params.append('shared', options.shared);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);
  if (options.hasOwnProperty('pageSize')) params.append('pageSize', options.pageSize);
  if (options.hasOwnProperty('pageNumber')) params.append('pageNumber', options.pageNumber);

  let response = undefined;
  if (!options.hasOwnProperty('versionId'))
    response = await ep.getApplicationVersions(applicationId, params);
  else
    response = await ep.getApplicationVersionByID(options.versionId, params);
  results = {data: results.concat(response.data), meta: response.meta};

  let domain = undefined;
  let application = undefined;
  if (results.data.length > 0) {
    response = await ep.getApplicationByID(applicationId);
    application = response.data;
    response = await ep.getApplicationDomainByID(application.applicationDomainId);
    domain = response.data;
  }

  for (let i=0; i<results.data.length; i++) {
    results.data[i].domainId = domain.id;
    results.data[i].domainName = domain.name;
    results.data[i].application = application;
  }

  let allEvents = {};
  let allEventVersions = {};
  for (let i=0; i<results.data.length; i++) {
    let events = {};
    let eventVersions = {};
    for (let j=0; j<results.data[i].declaredProducedEventVersionIds.length; j++) {
      if (!allEvents[results.data[i].declaredProducedEventVersionIds[j]]) {
        if (!allEventVersions[results.data[i].declaredProducedEventVersionIds[j]]) {
          response = await ep.getEventVersionByID(results.data[i].declaredProducedEventVersionIds[j]);
          allEventVersions[results.data[i].declaredProducedEventVersionIds[j]] = response.data;
        }
        if (!allEvents[results.data[i].declaredProducedEventVersionIds[j]]) {
          response = await ep.getEventByID(allEventVersions[results.data[i].declaredProducedEventVersionIds[j]].eventId);
          allEvents[results.data[i].declaredProducedEventVersionIds[j]] = response.data;
        }
      }

      if (!eventVersions[results.data[i].declaredProducedEventVersionIds[j]])
        eventVersions[results.data[i].declaredProducedEventVersionIds[j]] = allEventVersions[results.data[i].declaredProducedEventVersionIds[j]]
      if (!events[results.data[i].declaredProducedEventVersionIds[j]])
        events[results.data[i].declaredProducedEventVersionIds[j]] = allEvents[results.data[i].declaredProducedEventVersionIds[j]]

    }
    for (let j=0; j<results.data[i].declaredConsumedEventVersionIds.length; j++) {
      if (!allEvents[results.data[i].declaredConsumedEventVersionIds[j]]) {
        if (!allEventVersions[results.data[i].declaredConsumedEventVersionIds[j]]) {
          response = await ep.getEventVersionByID(results.data[i].declaredConsumedEventVersionIds[j]);
          allEventVersions[results.data[i].declaredConsumedEventVersionIds[j]] = response.data;
        }
        if (!allEvents[results.data[i].declaredConsumedEventVersionIds[j]]) {
          response = await ep.getEventByID(allEventVersions[results.data[i].declaredConsumedEventVersionIds[j]].eventId);;
          allEvents[results.data[i].declaredConsumedEventVersionIds[j]] = response.data;
        }
      }

      if (!eventVersions[results.data[i].declaredConsumedEventVersionIds[j]])
        eventVersions[results.data[i].declaredConsumedEventVersionIds[j]] = allEventVersions[results.data[i].declaredConsumedEventVersionIds[j]]
      if (!events[results.data[i].declaredConsumedEventVersionIds[j]])
        events[results.data[i].declaredConsumedEventVersionIds[j]] = allEvents[results.data[i].declaredConsumedEventVersionIds[j]]

    }
    results.data[i].events = events;
    results.data[i].eventVersions = eventVersions;
  }
  return results;
}

const getSolaceApplicationEvents = async (applicationId, solaceCloudToken, options=null) => {
  let results = await getSolaceApplicationResources(applicationId, solaceCloudToken, options);
  results.data = Object.values(results.data);
  return results;
}

const getSolaceApplicationSchemas = async (applicationId, solaceCloudToken, options=null) => {
  let results = await getSolaceApplicationResources(applicationId, solaceCloudToken, options);
  results.data = Object.values(results.data).filter(obj => obj.schema !== undefined);
  return results;
}

const getSolaceApplicationResources = async (applicationId, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  if (options.hasOwnProperty('pageSize')) params.append('pageSize', options.pageSize);
  if (options.hasOwnProperty('pageNumber')) params.append('pageNumber', options.pageNumber);

  let response = await ep.getApplicationVersions(applicationId, params);
  results = {data: results.concat(response.data), meta: response.meta};

  let application = undefined;
  if (results.data.length > 0) {
    response = await ep.getApplicationByID(applicationId);
    application = response.data;
  } 

  let schemas = {};
  let eventVersions = {};
  for (let i=0; i<results.data.length; i++) {    
    for (let j=0; j<results.data[i].declaredProducedEventVersionIds.length; j++) {
      if (!eventVersions[results.data[i].declaredProducedEventVersionIds[j]]) {
        response = await ep.getEventVersionByID(results.data[i].declaredProducedEventVersionIds[j]);
        let eventVersion = response.data;
        response = await ep.getEventByID(eventVersion.eventId);
        eventVersion.event = response.data;
        eventVersion.applicationDomainId = options?.domainId;
        eventVersion.domainName = options?.domainName;
        eventVersion.application = application;
    
        eventVersions[results.data[i].declaredProducedEventVersionIds[j]] = eventVersion;
        if (eventVersion.schemaVersionId && !eventVersions[eventVersion.schemaVersionId]) {
          response = await ep.getSchemaVersionByID(eventVersion.schemaVersionId);
          let schemaVersion = response.data;
          response = await ep.getSchemaByID(schemaVersion.schemaId);
          schemas[schemaVersion.schemaId] = response.data;
          eventVersions[results.data[i].declaredProducedEventVersionIds[j]].schema = schemas[schemaVersion.schemaId];
          eventVersions[results.data[i].declaredProducedEventVersionIds[j]].schemaVersion = schemaVersion;
        }
      }
    }
    for (let j=0; j<results.data[i].declaredConsumedEventVersionIds.length; j++) {
      if (!eventVersions[results.data[i].declaredConsumedEventVersionIds[j]]) {
        response = await ep.getEventVersionByID(results.data[i].declaredConsumedEventVersionIds[j]);
        let eventVersion = response.data;
        response = await ep.getEventByID(eventVersion.eventId);
        eventVersion.event = response.data;
        eventVersion.applicationDomainId = options?.domainId;
        eventVersion.domainName = options?.domainName;
        eventVersion.application = application;

        eventVersions[results.data[i].declaredConsumedEventVersionIds[j]] = eventVersion;
        if (eventVersion.schemaVersionId && !eventVersions[eventVersion.schemaVersionId]) {
          response = await ep.getSchemaVersionByID(eventVersion.schemaVersionId);
          let schemaVersion = response.data;
          response = await ep.getSchemaByID(schemaVersion.schemaId);
          schemas[schemaVersion.schemaId] = response.data;
          schemaVersion.schema = schemas[schemaVersion.schemaId];
          eventVersions[results.data[i].declaredConsumedEventVersionIds[j]].schema = schemas[schemaVersion.schemaId];
          eventVersions[results.data[i].declaredConsumedEventVersionIds[j]].schemaVersion = schemaVersion;
        }
      }
    }
  }

  results = {data: eventVersions, meta: results.meta};
  return results;
}

const getSolaceEvents = async (mode, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  if (mode === 'name') params.append('name', options.name);
  if (options.hasOwnProperty('domainId')) params.append('applicationDomainId', options.domainId);
  if (options.hasOwnProperty('shared')) params.append('shared', options.shared);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);
  if (options.hasOwnProperty('pageSize')) params.append('pageSize', options.pageSize);
  if (options.hasOwnProperty('pageNumber')) params.append('pageNumber', options.pageNumber);

  if (mode === 'all' || mode === 'name') {
    let response = await ep.getEvents(params);
    results = {data: results.concat(response.data), meta: response.meta};
  } else if (mode === 'id') {
    let response = await ep.getEventByID(options.id, params);
    results = {data: results.concat(response.data), meta: response.meta};
  }

  let domains = {};
  for (let i=0; i<results.data.length; i++) {
    if (!domains[results.data[i].applicationDomainId])
      domains[results.data[i].applicationDomainId] = await ep.getApplicationDomainName(results.data[i].applicationDomainId);
    results.data[i].domainId = results.data[i].applicationDomainId;
    results.data[i].domainName = domains[results.data[i].applicationDomainId];
  }

  return results;
}

const getSolaceEventVersions = async (eventId, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  if (options.hasOwnProperty('domainId')) params.append('applicationDomainId', options.domainId);
  if (options.hasOwnProperty('shared')) params.append('shared', options.shared);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);
  if (options.hasOwnProperty('pageSize')) params.append('pageSize', options.pageSize);
  if (options.hasOwnProperty('pageNumber')) params.append('pageNumber', options.pageNumber);
  
  let response = undefined;
  if (options.hasOwnProperty('versionId'))
    response = await ep.getEventVersionByID(options.versionId, params);
  else
    response = await ep.getEventVersions(eventId, params);
  results = {data: results.concat(response.data), meta: response.meta};

  let event = undefined;
  if (results.data.length > 0) {
      response = await ep.getEventByID(results.data[0].eventId);
      event = response.data;
  }

  for (let i=0; i<results.data.length; i++) {
    results.data[i].applicationDomainId = options?.domainId;
    results.data[i].domainName = options?.domainName;
    results.data[i].event = event;
  }  

  let schemas = {};
  let schemaVersions = {};
  for (let i=0; i<results.data.length; i++) {    
    if (results.data[i].schemaVersionId) {
      if (!schemaVersions[results.data[i].schemaVersionId]) {
        response = await ep.getSchemaVersionByID(results.data[i].schemaVersionId);
        schemaVersions[results.data[i].schemaVersionId] = response.data;
      }
      if (!schemas[results.data[i].schemaVersionId]) {
        response = await ep.getSchemaByID(schemaVersions[results.data[i].schemaVersionId].schemaId);
        schemas[results.data[i].schemaVersionId] = response.data;
      }
    }

    results.data[i].schemaVersion = results.data[i].schemaVersionId ? schemaVersions[results.data[i].schemaVersionId] : undefined;
    results.data[i].schema = results.data[i].schemaVersionId ? schemas[results.data[i].schemaVersionId] : undefined;
  }

  let allAppVersions = {};
  let allApps = {};

  for (let i=0; i<results.data.length; i++) {
    let appVersions = {};
    let apps = {};
    
    for (let j=0; j<results.data[i].declaredProducingApplicationVersionIds.length; j++) {
      if (!allApps[results.data[i].declaredProducingApplicationVersionIds[j]]) {
        if (!allAppVersions[results.data[i].declaredProducingApplicationVersionIds[j]]) {
          response = await ep.getApplicationVersionByID(results.data[i].declaredProducingApplicationVersionIds[j]);;
          allAppVersions[results.data[i].declaredProducingApplicationVersionIds[j]] = response.data;
        }
        if (!allApps[results.data[i].declaredProducingApplicationVersionIds[j]]) {
          response = await ep.getApplicationByID(allAppVersions[results.data[i].declaredProducingApplicationVersionIds[j]].applicationId);
          allApps[results.data[i].declaredProducingApplicationVersionIds[j]] = response.data;
        }
      }

      if (!appVersions[results.data[i].declaredProducingApplicationVersionIds[j]])
        appVersions[results.data[i].declaredProducingApplicationVersionIds[j]] = allAppVersions[results.data[i].declaredProducingApplicationVersionIds[j]]
      if (!apps[results.data[i].declaredProducingApplicationVersionIds[j]])
        apps[results.data[i].declaredProducingApplicationVersionIds[j]] = allApps[results.data[i].declaredProducingApplicationVersionIds[j]]
    }
    for (let j=0; j<results.data[i].declaredConsumingApplicationVersionIds.length; j++) {
      if (!allApps[results.data[i].declaredConsumingApplicationVersionIds[j]]) {
        if (!allAppVersions[results.data[i].declaredConsumingApplicationVersionIds[j]]) {
          response = await ep.getApplicationVersionByID(results.data[i].declaredConsumingApplicationVersionIds[j]);
          allAppVersions[results.data[i].declaredConsumingApplicationVersionIds[j]] = response.data;
        }
        if (!allApps[results.data[i].declaredConsumingApplicationVersionIds[j]]) {
          response = await ep.getApplicationByID(allAppVersions[results.data[i].declaredConsumingApplicationVersionIds[j]].applicationId);
          allApps[results.data[i].declaredConsumingApplicationVersionIds[j]] = response.data;
        }
      }
      if (!appVersions[results.data[i].declaredConsumingApplicationVersionIds[j]])
        appVersions[results.data[i].declaredConsumingApplicationVersionIds[j]] = allAppVersions[results.data[i].declaredConsumingApplicationVersionIds[j]]
      if (!apps[results.data[i].declaredConsumingApplicationVersionIds[j]])
        apps[results.data[i].declaredConsumingApplicationVersionIds[j]] = allApps[results.data[i].declaredConsumingApplicationVersionIds[j]]
    }

    results.data[i].apps = apps;
    results.data[i].appVersions = appVersions;
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
  if (options.hasOwnProperty('pageSize')) params.append('pageSize', options.pageSize);
  if (options.hasOwnProperty('pageNumber')) params.append('pageNumber', options.pageNumber);

  if (mode === 'all' || mode === 'name') {
    let response = await ep.getSchemas(params);
    results = {data: results.concat(response.data), meta: response.meta};
  } else if (mode === 'id') {
    let response = await ep.getSchemaByID(options.id, params);
    results = {data: results.concat(response.data), meta: response.meta};
  }

  let domains = {};
  for (let i=0; i<results.data.length; i++) {
    if (!domains[results.data[i].applicationDomainId])
      domains[results.data[i].applicationDomainId] = await ep.getApplicationDomainName(results.data[i].applicationDomainId);
    results.data[i].domainId = results.data[i].applicationDomainId;
    results.data[i].domainName = domains[results.data[i].applicationDomainId];
  }

  return results;
}

const getSolaceSchemaVersions = async (schemaId, solaceCloudToken, options=null) => {
  let results = [];
  let params = new URLSearchParams();
  const ep = new EventPortal(solaceCloudToken.token);

  let result = undefined;
  if (options.hasOwnProperty('domainId')) params.append('applicationDomainId', options.domainId);
  if (options.hasOwnProperty('shared')) params.append('shared', options.shared);
  if (options.hasOwnProperty('sort')) params.append('sort', 'name:'+options.sort);
  if (options.hasOwnProperty('pageSize')) params.append('pageSize', options.pageSize);
  if (options.hasOwnProperty('pageNumber')) params.append('pageNumber', options.pageNumber);
  
  let response = undefined;
  if (options.hasOwnProperty('versionId'))
    response = await ep.getSchemaVersionByID(options.versionId, params);
  else
    response = await ep.getSchemaVersions(schemaId, params);
  results = {data: results.concat(response.data), meta: response.meta};

  for (let i=0; i<results.data.length; i++) {
    results.data[i].applicationDomainId = options?.domainId;
    results.data[i].domainName = options?.domainName;
    results.data[i].schemaName = options?.name;
  }

  let schemas = {};
  let allEventVersions = {};
  let allEvents = {};

  for (let i=0; i<results.data.length; i++) {
    if (!schemas[results.data[i].schemaId]) {
      response = await ep.getSchemaByID(results.data[i].schemaId);
      schemas[results.data[i].schemaId] = response.data;
    }
    results.data[i].schema = schemas[results.data[i].schemaId];

    let eventVersions = {};
    let events = {};
    
    if (results.data[i].referencedByEventVersionIds) {
      for (let j=0; j<results.data[i].referencedByEventVersionIds.length; j++) {
        if (!allEvents[results.data[i].referencedByEventVersionIds[j]]) {
          if (!allEventVersions[results.data[i].referencedByEventVersionIds[j]]) {
            response = await ep.getEventVersionByID(results.data[i].referencedByEventVersionIds[j]);
            allEventVersions[results.data[i].referencedByEventVersionIds[j]] = response.data;
          }
          if (!allEvents[results.data[i].referencedByEventVersionIds[j]]) {
            response = await ep.getEventByID(allEventVersions[results.data[i].referencedByEventVersionIds[j]].eventId);
            allEvents[results.data[i].referencedByEventVersionIds[j]] = response.data;
          }
        }

        eventVersions[results.data[i].referencedByEventVersionIds[j]] = allEventVersions[results.data[i].referencedByEventVersionIds[j]]
        events[results.data[i].referencedByEventVersionIds[j]] = allEvents[results.data[i].referencedByEventVersionIds[j]]
      }
    }

    results.data[i].events = events;
    results.data[i].eventVersions = eventVersions;
  }


  return results;
}

const getApplicationDomainId = async (domainName, solaceCloudToken) => {
  console.log('getApplicationDomainId');
  const ep = new EventPortal(solaceCloudToken.token);

  try {
    let id = await ep.getApplicationDomainID(domainName);
    return id;
  } catch (error) {
    console.log(error);
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
  getSolaceSchemaVersions,
  getApplicationDomainId
}