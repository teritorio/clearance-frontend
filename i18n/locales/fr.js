export default {
  common: {
    loading: 'Chargement...',
  },
  app: {
    title: '"Clearance" pour les données OSM',
    summary:
      '"Clearance" est un outil pour produire des extraits OSM et les maintenir à jour tout en respectant des règles de qualité. Il est basé sur des mises à jour partielles et locales. Les groupes de données rejetées doivent être corrigés dans OSM ou accepté manuellement. Les changements OSM à réviser sont traités de façon collaborative par des groupes d’intérêts.',
    github: 'Clearance sur Github',
    attribution: {
      data: 'Données et cartes',
      osm: '© contributeurs OpenStreetMap',
    },
    project: {
      new: 'Pour ajouter un nouveau projet, contactez l\'administrateur :',
      join: 'Pour rejoindre le projet, contactez l\'un des membres. Vous pouvez utiliser les messages OSM.',
      mainContacts: 'Contact principal :',
    },
    back: 'Retour',
  },
  page: {
    index: {
      myProjects: 'Mes projets',
      publicProjects: 'Projets publics',
      uninitializedProjects: 'Projets non initialisés',
      empty: 'Aucun projet',
    },
  },
  logs: {
    rapprochements_count: '{n} rapprochements',
    validate_locha: 'Valider le LoCha',
    accept_success: 'Validation enregistrée',
    accept_error: 'Erreur lors de la validation',
    objects: 'Objets',
    created: 'ajouté',
    deleted: 'supprimé',
    filters: 'Filtres',
    data: 'Groupe de données à examiner',
    data_details:
      'Données listées ici parce qu\'elles ont été ciblées et qu\'elles ne respectent pas les règles de validation.',
    data_details_osm:
      'Corrigez dans OSM si nécessaire, et attendez ici la mise à jour des données. Les données seront automatiquement supprimées de la liste lorsqu\'elles auront passé les règles de validation.',
    data_details_manual:
      'Si, après examen, tout est bon, utilisez le contrôle ✓ pour intégrer les modifications.',
    tags_more: '(et plus)',
    validate_selection: 'Valider les objets filtrés',
    no_data: 'Aucune donnée disponible pour le moment.',
    no_results: 'Aucun résultat ne correspond aux filtres actuels.',
  },
  project: {
    control: 'Contrôle',
    details: 'Détails',
    seeMore: '+ Voir les détails',
    user_group_label: 'Groupe',
    user_group_users: 'Utilisateurs',
    settings: '⚙ Paramètres',
    data: '✓ Données',
    start: 'Début',
    lastUpdate: 'Fraîcheur des données',
    toBeValidated: 'À valider',
    overpassUrl: 'Overpass-like API URL :',
    extract: 'Extrait :',
    diff: 'Diff',
  },
  user: {
    login: 'Connexion',
    logout: 'Déconnexion',
  },
  validators: {
    validatorId: 'Validateur ID',
    action: 'Action',
    description: 'Description',
    other: 'Autre',
  },
  atomFeed: 'Flux Atom',
}
