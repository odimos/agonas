const translations = {
  gr: {
    // Nav
    nav_dashboard:   'Dashboard',
    nav_tournaments: 'Τουρνουά',
    nav_entities:    'Οντότητες',
    nav_page:        'Σελίδα',

    // SideMenu  (sm_title → uppercase)
    sm_title:    'Οντοτητες',
    sm_subtitle: 'Διαχείριση',
    sm_teams:    'Ομάδες',
    sm_players:  'Παίκτες',
    sm_referees: 'Διαιτητές',
    sm_stadiums: 'Γήπεδα',
    sm_requests: 'Αιτήματα',

    // Tournament SideMenu  (tm_subtitle → uppercase)
    tm_title:    'Τουρνουά',
    tm_subtitle: 'Διαχειριση Πρωταθληματος',
    tm_new:      'Νέο Τουρνουά',

    // Tournament Overview  (cardLabel, dataCellLabel, decoTitle, indicator, dangerTitle, dangerBtn, graphBtn → uppercase)
    to_subtitle:      'Ρύθμιση & Διαχείριση',
    to_save:          'Αποθήκευση',
    to_progress:        'Προοδος Τουρνουα',
    to_gen_graph:       'Δημιουργια Γραφηματος',
    to_total_teams:     'Συνολο Ομαδων',
    to_remaining_teams: 'Υπολειπομενες Ομαδες',
    to_start_date:    'Ημερομηνια Εναρξης',
    to_type:          'Τυπος Τουρνουα',
    to_visibility:    'Ορατοτητα',
    to_league_env:    'Περιβαλλον Πρωταθληματος',
    to_realtime:      'Συγχρονισμος',
    to_auto_archive:  'Αυτοματη Αρχειοθετηση',
    to_danger_zone:   'Ζωνη Κινδυνου',
    to_danger_text:   'Η διαγραφή τουρνουά είναι μη αναστρέψιμη. Ολες οι φάσεις, τα δεδομένα ομάδων και οι αναφορές θα διαγραφούν οριστικά από το σύστημα.',
    to_delete:        'Διαγραφη Τουρνουα',

    // Phase
    phase_label:        'Φάση',

    // Phase  (headerLabel, sectionTitle, matchStatusFinal, footerOutlineBtn, footerFinishBtn, inline delete → uppercase)
    ph_label:           'Τρεχουσα Διαχειριση',
    ph_status:          'Κατάσταση',
    ph_status_active:   'Ενεργή',
    ph_status_inactive: 'Ανενεργή',
    ph_qual_teams:      'Εγκεκριμενες Ομαδες',
    ph_participating:   'σύνολο συμμετεχόντων',
    ph_add_team:        'Προσθήκη Ομάδας',
    ph_search:          'Αναζήτηση ομάδων...',
    ph_matches:         'Προγραμματισμενοι Αγωνες',
    ph_gen_program:     'Δημιουργια Προγραμματος',
    ph_preview:         'Προεπισκόπηση Κανονισμών',
    ph_finish:          'Ολοκληρωση Φασης',
    ph_eliminated:      'Αποκλεισμένη',
    ph_delete:          'Διαγραφη',
    ph_points:          'Βαθμοί:',
    ph_final:           'Τελικο',
    ph_scheduled:       'Προγρ/νο',

    // Dashboard  (filterLabel, chip, conflictBtn, tableFooter, footerLink, th, badge → uppercase)
    db_title:          'Πρόγραμμα Αγώνων',
    db_subtitle:       'Κεντρικη Διαχειριση Πρωταθληματος',
    db_week:           'Εβδομάδα',
    db_add_match:      'Προσθήκη Αγώνα',
    db_total_matches:  'ΣΥΝΟΛΟ ΑΓΩΝΩΝ',
    db_pending_scores: 'ΕΚΚΡΕΜΗ ΑΠΟΤΕΛΕΣΜΑΤΑ',
    db_f_status:       'Κατασταση',
    db_f_tournament:   'Τουρνουα',
    db_f_conflicts:    'Συγκρουσεις',
    db_no_conflicts:   'Καμια',
    db_conf_title:     'Συγκρουσεις Προγραμματος',
    db_no_matches:     'Δεν υπάρχουν αγώνες που ταιριάζουν με τα φίλτρα.',
    db_showing:        'Εμφανιση',
    db_of:             'απο',
    db_matches_week:   'αγωνες αυτη την εβδομαδα',
    db_export:         'Εξαγωγη CSV',
    db_print:          'Εκτυπωση',
    db_clear:          'Καθαρισμος',
    db_all_tournaments:'Ολα τα τουρνουά',
    db_conflict_s:     'συγκρουση',
    db_conflict_p:     'συγκρουσεις',
    db_col_tournament: 'Τουρνουα',
    db_col_status:     'Κατασταση',
    db_col_date:       'Ημερομηνια',
    db_col_time:       'Ωρα',
    db_col_stadium:    'Γηπεδο',
    db_col_home:       'Γηπεδουχος',
    db_col_group:      'Γκρουπ',
    db_col_away:       'Φιλοξενουμενος',
    db_col_score1:     'Σκορ 1',
    db_col_score2:     'Σκορ 2',
    db_col_referee:    'Διαιτητης',

    // Match statuses  (badge + chip → uppercase)
    ms_draft:    'Προχειρο',
    ms_expected: 'Αναμενομενο',
    ms_finished: 'Ολοκληρωμενο',
    ms_canceled: 'Ακυρωμενο',

    // Buttons / common
    btn_export: 'Κατέβασε ως CSV',
    btn_add:    'Προσθήκη',

    // Add labels per entity
    add_team:    'Προσθήκη Ομάδας',
    add_player:  'Προσθήκη Παίκτη',
    add_referee: 'Προσθήκη Διαιτητή',
    add_stadium: 'Προσθήκη Γηπέδου',

    // Teams page
    teams_title:    'Ομάδες',
    teams_active:   'ΕΝΕΡΓΕΣ ΟΜΑΔΕΣ',
    teams_requests: 'ΑΙΤΗΜΑΤΑ ΕΓΓΡΑΦΗΣ',
    teams_col_name:    'ΟΝΟΜΑ ΟΜΑΔΑΣ',
    teams_col_captain: 'ΑΡΧΗΓΟΣ',
    teams_col_contact: 'ΕΠΙΚΟΙΝΩΝΙΑ',
    teams_col_status:  'ΚΑΤΑΣΤΑΣΗ',

    // Players page
    players_title:    'Παίκτες',
    players_active:   'ΕΝΕΡΓΟΙ ΠΑΙΚΤΕΣ',
    players_requests: 'ΑΙΤΗΜΑΤΑ ΕΓΓΡΑΦΗΣ',
    players_col_name:   'ΟΝΟΜΑ',
    players_col_phone:  'ΤΗΛΕΦΩΝΟ',
    players_col_email:  'EMAIL',
    players_col_status: 'ΚΑΤΑΣΤΑΣΗ',

    // Referees page
    referees_title:    'Διαιτητές',
    referees_active:   'ΕΝΕΡΓΟΙ ΔΙΑΙΤΗΤΕΣ',
    referees_requests: 'ΑΙΤΗΜΑΤΑ ΕΓΓΡΑΦΗΣ',
    referees_col_name:   'ΟΝΟΜΑ',
    referees_col_phone:  'ΤΗΛΕΦΩΝΟ',
    referees_col_email:  'EMAIL',
    referees_col_status: 'ΚΑΤΑΣΤΑΣΗ',

    // Stadiums page
    stadiums_title:    'Γήπεδα',
    stadiums_active:   'ΕΝΕΡΓΑ ΓΗΠΕΔΑ',
    stadiums_col_name:    'ΟΝΟΜΑ',
    stadiums_col_address: 'ΔΙΕΥΘΥΝΣΗ',
    stadiums_col_cost:    'ΚΟΣΤΟΣ/ΩΡΑ',

    // DataTable
    dt_search:  'Αναζήτηση...',
    dt_showing: 'Εμφάνιση',
    dt_of:      'από',

    // ItemModal
    modal_delete: 'Διαγραφή',
    modal_cancel: 'Ακύρωση',
    modal_save:   'Αποθήκευση',
    modal_edit:   'Επεξεργασία',

    // CreateModal
    create_cancel: 'Ακύρωση',
    create_submit: 'Δημιουργία',
    create_player:  'Νέος Παίκτης',
    create_referee: 'Νέος Διαιτητής',
    create_stadium: 'Νέο Γήπεδο',
    create_team:    'Νέα Ομάδα',

    // Modal field labels (rendered uppercase via CSS — no accents needed)
    modal_first_name:     'Ονομα',
    modal_last_name:      'Επιθετο',
    modal_nickname:       'Ψευδωνυμο',
    modal_phone:          'Τηλεφωνο',
    modal_team_field:     'Ομαδα',
    modal_comments_label: 'Σχολια',
    modal_captain:        'Αρχηγος',
    modal_vice:           'Υπαρχηγος',
    modal_players_label:  'Παικτες',
    modal_add_player:     'Προσθηκη Παικτη',
    modal_no_players:     'Δεν υπάρχουν παίκτες',
    modal_no_reg_players: 'Δεν υπάρχουν εγγεγραμμένοι παίκτες',
    modal_select_player:  '— Επιλογή παίκτη —',
    modal_active_label:   'Ενεργη',
    modal_stadium_name:   'Ονομα Γηπεδου',
    modal_address:        'Διευθυνση',
    modal_cost_hour:      'Κοστος/Ωρα (€)',
    modal_map:            'Χαρτης',
    modal_no_map:         'Δεν έχει οριστεί χάρτης',

    // Requests page
    req_subtitle:    'Ελέγξτε και διαχειριστείτε εκκρεμείς εγγραφές',
    req_col_name:    'Ονομα Αιτουντος',
    req_col_type:    'Τυπος',
    req_col_date:    'Ημερομηνια',
    req_col_contact: 'Επικοινωνια',
    req_col_status:  'Κατασταση',
    req_col_actions: 'Ενεργειες',
    req_approved:    'Εγκεκριμενο',
    req_pending:     'Εκκρεμες',
    req_rejected:    'Απορριφθεν',
    req_type_team:   'Ομαδα',
    req_type_indiv:  'Μεμονωμενος',

    // Entity statuses (badge display)
    'ΕΝΕΡΓΟΣ':   'ΕΝΕΡΓΟΣ',
    'ΑΝΕΝΕΡΓΟΣ': 'ΑΝΕΝΕΡΓΟΣ',
    'ΕΝΕΡΓΗ':    'ΕΝΕΡΓΗ',
    'ΑΝΕΝΕΡΓΗ':  'ΑΝΕΝΕΡΓΗ',
    'ΕΝΕΡΓΟ':    'ΕΝΕΡΓΟ',
    'ΑΝΕΝΕΡΓΟ':  'ΑΝΕΝΕΡΓΟ',
  },

  en: {
    // Nav
    nav_dashboard:   'Dashboard',
    nav_tournaments: 'Tournaments',
    nav_entities:    'Entities',
    nav_page:        'Page',

    // SideMenu
    sm_title:    'Entities',
    sm_subtitle: 'Contextual Management',
    sm_teams:    'Teams',
    sm_players:  'Players',
    sm_referees: 'Referees',
    sm_stadiums: 'Stadiums',
    sm_requests: 'Requests',

    // Tournament SideMenu
    tm_title:    'Tournaments',
    tm_subtitle: 'League Management',
    tm_new:      'New Tournament',

    // Tournament Overview
    to_subtitle:      'Configuration & Management Dashboard',
    to_save:          'Save Changes',
    to_progress:        'Tournament Progress',
    to_gen_graph:       'Generate Graph',
    to_total_teams:     'Total Teams',
    to_remaining_teams: 'Remaining Teams',
    to_start_date:    'Start Date',
    to_type:          'Tournament Type',
    to_visibility:    'Visibility',
    to_league_env:    'League Environment',
    to_realtime:      'Real-time Sync',
    to_auto_archive:  'Auto-Archive Enabled',
    to_danger_zone:   'Danger Zone',
    to_danger_text:   'Deleting a tournament is irreversible. All phases, team data, and generated reports will be permanently purged from the system.',
    to_delete:        'Delete Tournament',

    // Phase
    phase_label:        'Phase',

    ph_label:           'Current Management',
    ph_status:          'Status',
    ph_status_active:   'Active',
    ph_status_inactive: 'Inactive',
    ph_qual_teams:      'Qualified Teams',
    ph_participating:   'total participating',
    ph_add_team:        'Add Team',
    ph_search:          'Search teams...',
    ph_matches:         'Scheduled Matches',
    ph_gen_program:     'Generate Program',
    ph_preview:         'Preview Ruleset',
    ph_finish:          'Finish Phase',
    ph_eliminated:      'Eliminated',
    ph_delete:          'Delete',
    ph_points:          'League Points:',
    ph_final:           'Final',
    ph_scheduled:       'Scheduled',

    // Dashboard
    db_title:          'Match Schedule',
    db_subtitle:       'Executive League Management Console',
    db_week:           'Week',
    db_add_match:      'Add Match',
    db_total_matches:  'TOTAL MATCHES',
    db_pending_scores: 'PENDING SCORES',
    db_f_status:       'Status',
    db_f_tournament:   'Tournament',
    db_f_conflicts:    'Conflicts',
    db_no_conflicts:   'None',
    db_conf_title:     'Scheduling Conflicts',
    db_no_matches:     'No matches match the current filters.',
    db_showing:        'Showing',
    db_of:             'of',
    db_matches_week:   'matches this week',
    db_export:         'Export to CSV',
    db_print:          'Print Sheet',
    db_clear:          'Clear',
    db_all_tournaments:'All tournaments',
    db_conflict_s:     'conflict',
    db_conflict_p:     'conflicts',
    db_col_tournament: 'Tournament',
    db_col_status:     'Status',
    db_col_date:       'Date',
    db_col_time:       'Time',
    db_col_stadium:    'Stadium',
    db_col_home:       'Home Team',
    db_col_group:      'Group',
    db_col_away:       'Away Team',
    db_col_score1:     'Score 1',
    db_col_score2:     'Score 2',
    db_col_referee:    'Referee',

    // Match statuses
    ms_draft:    'Draft',
    ms_expected: 'Expected',
    ms_finished: 'Finished',
    ms_canceled: 'Canceled',

    // Buttons / common
    btn_export: 'Export as CSV',
    btn_add:    'Add',

    // Add labels per entity
    add_team:    'Add Team',
    add_player:  'Add Player',
    add_referee: 'Add Referee',
    add_stadium: 'Add Stadium',

    // Teams page
    teams_title:    'Teams',
    teams_active:   'ACTIVE TEAMS',
    teams_requests: 'REGISTRATION REQUESTS',
    teams_col_name:    'TEAM NAME',
    teams_col_captain: 'CAPTAIN',
    teams_col_contact: 'CONTACT',
    teams_col_status:  'STATUS',

    // Players page
    players_title:    'Players',
    players_active:   'ACTIVE PLAYERS',
    players_requests: 'REGISTRATION REQUESTS',
    players_col_name:   'NAME',
    players_col_phone:  'PHONE',
    players_col_email:  'EMAIL',
    players_col_status: 'STATUS',

    // Referees page
    referees_title:    'Referees',
    referees_active:   'ACTIVE REFEREES',
    referees_requests: 'REGISTRATION REQUESTS',
    referees_col_name:   'NAME',
    referees_col_phone:  'PHONE',
    referees_col_email:  'EMAIL',
    referees_col_status: 'STATUS',

    // Stadiums page
    stadiums_title:    'Stadiums',
    stadiums_active:   'ACTIVE STADIUMS',
    stadiums_col_name:    'NAME',
    stadiums_col_address: 'ADDRESS',
    stadiums_col_cost:    'COST/HOUR',

    // DataTable
    dt_search:  'Search...',
    dt_showing: 'Showing',
    dt_of:      'of',

    // ItemModal
    modal_delete: 'Delete',
    modal_cancel: 'Cancel',
    modal_save:   'Save',
    modal_edit:   'Edit',

    // CreateModal
    create_cancel: 'Cancel',
    create_submit: 'Create',
    create_player:  'New Player',
    create_referee: 'New Referee',
    create_stadium: 'New Stadium',
    create_team:    'New Team',

    // Modal field labels
    modal_first_name:     'First Name',
    modal_last_name:      'Last Name',
    modal_nickname:       'Nickname',
    modal_phone:          'Phone',
    modal_team_field:     'Team',
    modal_comments_label: 'Comments',
    modal_captain:        'Captain',
    modal_vice:           'Vice Captain',
    modal_players_label:  'Players',
    modal_add_player:     'Add Player',
    modal_no_players:     'No players',
    modal_no_reg_players: 'No registered players',
    modal_select_player:  '— Select player —',
    modal_active_label:   'Active',
    modal_stadium_name:   'Stadium Name',
    modal_address:        'Address',
    modal_cost_hour:      'Cost/Hour (€)',
    modal_map:            'Map',
    modal_no_map:         'No map set',

    // Requests page
    req_subtitle:    'Review and manage pending registrations',
    req_col_name:    'Requester Name',
    req_col_type:    'Type',
    req_col_date:    'Date Requested',
    req_col_contact: 'Contact Info',
    req_col_status:  'Status',
    req_col_actions: 'Actions',
    req_approved:    'Approved',
    req_pending:     'Pending',
    req_rejected:    'Rejected',
    req_type_team:   'Team',
    req_type_indiv:  'Individual',

    // Entity statuses (badge display)
    'ΕΝΕΡΓΟΣ':   'ACTIVE',
    'ΑΝΕΝΕΡΓΟΣ': 'INACTIVE',
    'ΕΝΕΡΓΗ':    'ACTIVE',
    'ΑΝΕΝΕΡΓΗ':  'INACTIVE',
    'ΕΝΕΡΓΟ':    'ACTIVE',
    'ΑΝΕΝΕΡΓΟ':  'INACTIVE',
  },
}

export default translations
