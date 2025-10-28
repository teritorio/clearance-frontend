export default {
  app: {
    title: 'Clearance for OSM Data',
    summary:
      '"Clearance" is a tool for producing OSM extracts and keeping them up to date while respecting quality rules. It is based on partial and local updates. Rejected data groups must be corrected in OSM or accepted manually. OSM changes to be revised are handled collaboratively by interest groups.',
    github: 'Clearance on Github',
    attribution: {
      data: 'All data and maps',
      osm: '© OpenStreetMap contributors',
    },
    project: {
      new: 'To add a new project contact administrator:',
      join: 'To join the project contact one of the project member. You can use OSM messages.',
      mainContacts: 'Main contact:',
    },
    back: 'Back',
  },
  page: {
    index: {
      myProjects: 'My projects',
      publicProjects: 'Public projects',
      empty: 'No project',
    },
  },
  logs: {
    object_count: '{n} objects',
    objects: 'Objects',
    created: 'created',
    deleted: 'deleted',
    filters: 'Filtres',
    data: 'Group of data to review',
    data_details:
      'Data listed here because targeted and fail to comply with the validation rules.',
    data_details_osm:
      'Fix in OSM if required, and wait here for the data update. Will be removed automaticaliy from the list when pass the validation.',
    data_details_manual:
      'If after review it is ok, use the ✓ check to integrate the changes.',
    tags_more: '(and more)',
    validate_selection: 'Validate all filtered',
  },
  project: {
    control: 'Control',
    details: 'Details',
    seeMore: '+ See details',
    user_group_label: 'Group',
    user_group_users: 'Users',
    settings: '⚙ Settings',
    data: '✓ Data',
    start: 'Start',
    lastUpdate: 'Data freshness',
    toBeValidated: 'To be validated',
    overpassUrl: 'Overpass-like API URL:',
    extract: 'Extract:',
    diff: 'Diff',
  },
  user: {
    login: 'Login',
    logout: 'Logout',
  },
  validators: {
    validatorId: 'Validator ID',
    action: 'Action',
    description: 'Description',
    other: 'Other',
  },
  atomFeed: 'Atom Feed',
}
