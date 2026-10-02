export type Lang = "en" | "fr" | "el";

export const messages: Record<Lang, Record<string, string>> = {
  en: {
    loading: "Loading...",
    no_data: "No data",
    key: "Key",
    value: "Value",
    relay: "Relay {n}",
    input: "Input {n}",
    on: "On",
    off: "Off",
    name: "Name",
    description: "Description",
    start: "Start",
    stop: "Stop",
    relays: "Relays",
    digital_inputs: "Digital Inputs",
    module_status: "Module Status",
    alive: "Alive",
    messages_sent: "Messages Sent",
    messages_received: "Messages Received",
    disk_fill: "Disk Fill",
    load: "Load",
    temperature: "Temperature",
    energy_data: "Energy Data",
    api_token_missing: "API endpoint or token is missing.",
    failed_send: "Failed to send message",
    error: "Error: {message}",
    seconds_ago_one: "{n} second ago",
    seconds_ago_other: "{n} seconds ago",
    minutes_ago_one: "{n} minute ago",
    minutes_ago_other: "{n} minutes ago",
    hours_ago_one: "{n} hour ago",
    hours_ago_other: "{n} hours ago",
    days_ago_one: "{n} day ago",
    days_ago_other: "{n} days ago",
  },
  fr: {
    loading: "Chargement...",
    no_data: "Aucune donnée",
    key: "Clé",
    value: "Valeur",
    relay: "Relais {n}",
    input: "Entrée {n}",
    on: "Marche",
    off: "Arrêt",
    name: "Nom",
    description: "Description",
    start: "Démarrer",
    stop: "Arrêter",
    relays: "Relais",
    digital_inputs: "Entrées numériques",
    module_status: "État du module",
    alive: "Actif",
    messages_sent: "Messages envoyés",
    messages_received: "Messages reçus",
    disk_fill: "Remplissage du disque",
    load: "Charge",
    temperature: "Température",
    energy_data: "Données énergétiques",
    api_token_missing: "Le point de terminaison de l'API ou le jeton est manquant.",
    failed_send: "Échec de l'envoi du message",
    error: "Erreur : {message}",
    seconds_ago_one: "il y a {n} seconde",
    seconds_ago_other: "il y a {n} secondes",
    minutes_ago_one: "il y a {n} minute",
    minutes_ago_other: "il y a {n} minutes",
    hours_ago_one: "il y a {n} heure",
    hours_ago_other: "il y a {n} heures",
    days_ago_one: "il y a {n} jour",
    days_ago_other: "il y a {n} jours",
  },
  el: {
    loading: "Φόρτωση...",
    no_data: "Δεν υπάρχουν δεδομένα",
    key: "Κλειδί",
    value: "Τιμή",
    relay: "Ρελέ {n}",
    input: "Είσοδος {n}",
    on: "Ενεργό",
    off: "Ανενεργό",
    name: "Όνομα",
    description: "Περιγραφή",
    start: "Έναρξη",
    stop: "Διακοπή",
    relays: "Ρελέ",
    digital_inputs: "Ψηφιακές είσοδοι",
    module_status: "Κατάσταση μονάδας",
    alive: "Ενεργό",
    messages_sent: "Μηνύματα που στάλθηκαν",
    messages_received: "Μηνύματα που ελήφθησαν",
    disk_fill: "Πλήρωση δίσκου",
    load: "Φόρτος",
    temperature: "Θερμοκρασία",
    energy_data: "Δεδομένα ενέργειας",
    api_token_missing: "Λείπει το endpoint API ή το token.",
    failed_send: "Αποτυχία αποστολής μηνύματος",
    error: "Σφάλμα: {message}",
    seconds_ago_one: "πριν από {n} δευτερόλεπτο",
    seconds_ago_other: "πριν από {n} δευτερόλεπτα",
    minutes_ago_one: "πριν από {n} λεπτό",
    minutes_ago_other: "πριν από {n} λεπτά",
    hours_ago_one: "πριν από {n} ώρα",
    hours_ago_other: "πριν από {n} ώρες",
    days_ago_one: "πριν από {n} ημέρα",
    days_ago_other: "πριν από {n} ημέρες",
  },
};

export function normalizeLang(value: string | null | undefined): Lang {
  const raw = (value || "").trim().toLowerCase();
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("el") || raw.startsWith("gr")) return "el";
  return "en";
}

/** Resolve the language from the URL (?language=, ?lang= or ?locale=). */
export function getLanguage(): Lang {
  if (typeof window === "undefined") return "en";
  const params = new URLSearchParams(window.location.search);
  return normalizeLang(
    params.get("language") || params.get("lang") || params.get("locale")
  );
}

export function translate(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>
): string {
  const table = messages[lang] || messages.en;
  let text = table[key] ?? messages.en[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replace(new RegExp("\\{" + name + "\\}", "g"), String(value));
    }
  }
  return text;
}
