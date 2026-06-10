export default {
  common: {
    loading: 'Cargando...',
  },
  app: {
    title: '"Clearance" para datos OSM',
    summary:
      '"Clearance" es una herramienta para producir extractos OSM y mantenerlos actualizados respetando las normas de calidad. Se basa en actualizaciones parciales y locales. Los grupos de datos rechazados deben ser corregidos en OSM o aceptados manualmente. Los cambios OSM a revisar se gestionan de forma colaborativa por grupos de interés.',
    github: 'Clearance en Github',
    attribution: {
      data: 'Datos y mapas',
      osm: '© colaboradores OpenStreetMap',
    },
    project: {
      new: 'Para añadir un nuevo proyecto contacte con el administrador:',
      join: 'Para unirse al proyecto contacta con uno de los miembros. Puede usar mensajes OSM.',
      mainContacts: 'Contacto principal:',
    },
    back: 'Volver',
  },
  page: {
    index: {
      myProjects: 'Mis proyectos',
      publicProjects: 'Proyectos públicos',
      uninitializedProjects: 'Proyectos no inicializados',
      empty: 'Sin proyecto',
    },
  },
  logs: {
    rapprochements_count: '{n} correspondencias',
    validate_locha: 'Validar el LoCha',
    accept_success: 'Validación guardada',
    accept_error: 'Error durante la validación',
    objects: 'Objetos',
    created: 'creado',
    deleted: 'borrado',
    filters: 'Filtros',
    data: 'Grupo de datos a examinar',
    data_details:
      'Datos incluidos aquí porque se han selectivo y no cumplan las reglas de validación.',
    data_details_osm:
      'Arreglar en OSM si es necesario, y esperar aquí la actualización de los datos. Se eliminará automáticamente de la lista cuando pase la validación.',
    data_details_manual:
      'Si después de la comprobación es correcto, utiliza ✓ para integrar los cambios.',
    tags_more: '(y mas)',
    validate_selection: 'Validar objetos filtrados',
    no_data: 'No hay datos disponibles en este momento.',
    no_results: 'Ningún resultado coincide con los filtros actuales.',
  },
  project: {
    control: 'Control',
    details: 'Detalle',
    seeMore: '+ Ver los detalles',
    user_group_label: 'Groupo',
    user_group_users: 'Usuarios',
    settings: '⚙ Configuración',
    data: '✓ Datos',
    start: 'Inicio',
    lastUpdate: 'Frescura de los datos',
    toBeValidated: 'Por validar',
    overpassUrl: 'Overpass-like API URL:',
    extract: 'Extracto:',
    diff: 'Diff',
  },
  user: {
    login: 'Identificación',
    logout: 'Cerrar sesión',
  },
  validators: {
    validatorId: 'Validator ID',
    action: 'Acción',
    description: 'Descripción',
    other: 'Otro',
  },
  atomFeed: 'Fuente Atom',
}
