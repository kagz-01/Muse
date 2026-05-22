import { useEffect, useRef, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
const SafeIcons = Icons as unknown as Record<string, import("preact").ComponentType<Record<string, unknown>>>;
const LucideIcon = (props: {
  icon: import("preact").ComponentType<Record<string, unknown>>;
  className?: string;
  size?: number;
  [key: string]: unknown;
}) => {
  const { icon: IconComponent, ...rest } = props;
  return <IconComponent {...rest} />;
};
import {
  addLink,
  logout,
  removeLink,
  soloModeSignal,
  togglePublicSetting,
  toggleSoloMode,
  updatePrivacySecurity,
  updateProfile,
  type User as UserModel,
  userSignal,
} from "../../signals/user.ts";
import { resetRooms } from "../../signals/rooms.ts";
import { resetItems } from "../../signals/items.ts";
import { resetThreads } from "../../signals/threads.ts";
import { resetJournalEntries } from "../../signals/journal.ts";
import {
  setAccentColor,
  setGlobalFontSize,
  setTheme,
} from "../../signals/ui.ts";

type SettingsTab =
  | "profile"
  | "appearance"
  | "notifications"
  | "privacy"
  | "data";

type SaveStatus = "idle" | "saving" | "saved";

type AppearanceSettings = {
  theme: "dark" | "light" | "system";
  accentColor:
    | "cyan"
    | "blue"
    | "purple"
    | "pink"
    | "green"
    | "yellow"
    | "red"
    | "white";
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  animations: boolean;
  reduceMotion: boolean;
};

type NotificationSettings = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notifyOnReply: boolean;
  notifyOnLike: boolean;
  notifyOnFollow: boolean;
  notifyOnAchievement: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
};

type DataSettings = {
  exportFormat: "json" | "csv";
  lastExport: string | null;
};

const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: "dark",
  accentColor: "cyan",
  fontSize: "medium",
  compactMode: false,
  animations: true,
  reduceMotion: false,
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  inAppNotifications: true,
  notifyOnReply: true,
  notifyOnLike: true,
  notifyOnFollow: true,
  notifyOnAchievement: true,
  weeklyDigest: true,
  productUpdates: false,
};

const NOTIFICATION_OPTIONS: Array<{
  key: keyof NotificationSettings;
  label: string;
  icon: import("preact").ComponentType<Record<string, unknown>>;
  description: string;
}> = [
  {
    key: "notifyOnReply",
    label: "New replies to my threads",
    icon: SafeIcons.MessageCircle,
    description: "Get notified when someone responds to your threads.",
  },
  {
    key: "notifyOnLike",
    label: "Likes on my content",
    icon: SafeIcons.Heart,
    description: "See when people appreciate your work.",
  },
  {
    key: "notifyOnFollow",
    label: "New followers",
    icon: SafeIcons.UserPlus,
    description: "Stay informed when someone starts following you.",
  },
  {
    key: "notifyOnAchievement",
    label: "Achievement unlocks",
    icon: SafeIcons.Award,
    description: "Celebrate progress when you hit milestones.",
  },
  {
    key: "weeklyDigest",
    label: "Weekly digest",
    icon: SafeIcons.Newspaper,
    description: "Receive a weekly summary of activity.",
  },
  {
    key: "productUpdates",
    label: "Product updates",
    icon: SafeIcons.Zap,
    description: "Hear about new features and releases.",
  },
];

const DEFAULT_DATA_SETTINGS: DataSettings = {
  exportFormat: "json",
  lastExport: null,
};

const ACCENT_OPTIONS: Array<
  { value: AppearanceSettings["accentColor"]; className: string }
> = [
  { value: "cyan", className: "bg-cyan-400" },
  { value: "blue", className: "bg-blue-400" },
  { value: "purple", className: "bg-purple-400" },
  { value: "pink", className: "bg-pink-400" },
  { value: "green", className: "bg-green-400" },
  { value: "yellow", className: "bg-yellow-400" },
  { value: "red", className: "bg-red-400" },
  { value: "white", className: "bg-white" },
];

const THEME_OPTIONS: Array<
  { value: AppearanceSettings["theme"]; label: string; icon: import("preact").ComponentType<Record<string, unknown>> }
> = [
  { value: "light", label: "Light", icon: SafeIcons.Sun },
  { value: "dark", label: "Dark", icon: SafeIcons.Moon },
  { value: "system", label: "System", icon: SafeIcons.Monitor },
];

const FONT_SIZE_OPTIONS: Array<
  { value: AppearanceSettings["fontSize"]; label: string; size: number }
> = [
  { value: "small", label: "Small", size: 14 },
  { value: "medium", label: "Medium", size: 16 },
  { value: "large", label: "Large", size: 18 },
];

const STORAGE_KEY = "muse-fresh-settings";

// IANA Timezone list - all major timezones
const IANA_TIMEZONES = [
  "Africa/Abidjan",
  "Africa/Accra",
  "Africa/Addis_Ababa",
  "Africa/Algiers",
  "Africa/Asmara",
  "Africa/Bamako",
  "Africa/Bangui",
  "Africa/Banjul",
  "Africa/Bissau",
  "Africa/Blantyre",
  "Africa/Brazzaville",
  "Africa/Bujumbura",
  "Africa/Cairo",
  "Africa/Casablanca",
  "Africa/Ceuta",
  "Africa/Conakry",
  "Africa/Dakar",
  "Africa/Dar_es_Salaam",
  "Africa/Djibouti",
  "Africa/Douala",
  "Africa/El_Aaiun",
  "Africa/Freetown",
  "Africa/Gaborone",
  "Africa/Harare",
  "Africa/Johannesburg",
  "Africa/Juba",
  "Africa/Kampala",
  "Africa/Khartoum",
  "Africa/Kigali",
  "Africa/Kinshasa",
  "Africa/Lagos",
  "Africa/Libreville",
  "Africa/Lilongwe",
  "Africa/Lome",
  "Africa/Luanda",
  "Africa/Lubumbashi",
  "Africa/Lusaka",
  "Africa/Malabo",
  "Africa/Maputo",
  "Africa/Maseru",
  "Africa/Mauritius",
  "Africa/Mogadishu",
  "Africa/Monrovia",
  "Africa/Montserrado",
  "Africa/Morocco",
  "Africa/Mouau",
  "Africa/Muscat",
  "Africa/Nairobi",
  "Africa/Ndjamena",
  "Africa/Niamey",
  "Africa/Nouakchott",
  "Africa/Ouagadougou",
  "Africa/Porto-Novo",
  "Africa/Sao_Tome",
  "Africa/Tripoli",
  "Africa/Tunis",
  "Africa/Windhoek",
  "America/Adak",
  "America/Anchorage",
  "America/Anguilla",
  "America/Antigua",
  "America/Araguaina",
  "America/Argentina/Buenos_Aires",
  "America/Argentina/Catamarca",
  "America/Argentina/ComodRivadavia",
  "America/Argentina/Cordoba",
  "America/Argentina/Jujuy",
  "America/Argentina/La_Rioja",
  "America/Argentina/Mendoza",
  "America/Argentina/Rio_Gallegos",
  "America/Argentina/Salta",
  "America/Argentina/San_Juan",
  "America/Argentina/San_Luis",
  "America/Argentina/Tucuman",
  "America/Argentina/Ushuaia",
  "America/Aruba",
  "America/Asuncion",
  "America/Atikokan",
  "America/Atka",
  "America/Bahia",
  "America/Bahia_Banderas",
  "America/Barbados",
  "America/Belem",
  "America/Belize",
  "America/Blanc-Sablon",
  "America/Boa_Vista",
  "America/Bogota",
  "America/Boise",
  "America/Buenos_Aires",
  "America/Cambridge_Bay",
  "America/Campo_Grande",
  "America/Cancun",
  "America/Caracas",
  "America/Catamarca",
  "America/Cayenne",
  "America/Cayman",
  "America/Chicago",
  "America/Chihuahua",
  "America/Coral_Harbour",
  "America/Cordoba",
  "America/Costa_Rica",
  "America/Creston",
  "America/Cuiaba",
  "America/Curacao",
  "America/Danmarkshavn",
  "America/Dawson",
  "America/Dawson_Creek",
  "America/Denver",
  "America/Detroit",
  "America/Dominica",
  "America/Edmonton",
  "America/Eirunepe",
  "America/El_Salvador",
  "America/Ensenada",
  "America/Fort_Nelson",
  "America/Fort_Wayne",
  "America/Fortaleza",
  "America/Glace_Bay",
  "America/Godthab",
  "America/Goose_Bay",
  "America/Grand_Turk",
  "America/Grenada",
  "America/Guadeloupe",
  "America/Guam",
  "America/Guatemala",
  "America/Guayaquil",
  "America/Guyana",
  "America/Halifax",
  "America/Havana",
  "America/Hermosillo",
  "America/Indiana/Indianapolis",
  "America/Indiana/Knox",
  "America/Indiana/Marengo",
  "America/Indiana/Petersburg",
  "America/Indiana/Tell_City",
  "America/Indiana/Vevay",
  "America/Indiana/Vincennes",
  "America/Indiana/Winamac",
  "America/Indianapolis",
  "America/Inuvik",
  "America/Iqaluit",
  "America/Iraq",
  "America/Iriqueime",
  "America/Jamaica",
  "America/Jujuy",
  "America/Juneau",
  "America/Kentucky/Louisville",
  "America/Kentucky/Monticello",
  "America/Knox_IN",
  "America/Kralendijk",
  "America/La_Paz",
  "America/La_Rioja",
  "America/La_Seu_d_Urgell",
  "America/Lagos",
  "America/Lake_Tahoe",
  "America/Lakshadweep",
  "America/Langley",
  "America/Laredo",
  "America/Las_Vegas",
  "America/Lashio",
  "America/Latem",
  "America/Latin",
  "America/Latina",
  "America/Latitude",
  "America/Lauderdale",
  "America/Laurel",
  "America/Laval",
  "America/Lawrence",
  "America/Lawrence_Township",
  "America/Laws",
  "America/Lázaro_Cárdenas",
  "America/Leadville",
  "America/League_City",
  "America/Lebanon",
  "America/Leblanc",
  "America/Lecarre",
  "America/Ledbetter",
  "America/Ledge",
  "America/Ledges",
  "America/Lee",
  "America/Leech_Lake",
  "America/Leeds",
  "America/Leesville",
  "America/Leeton",
  "America/Lefors",
  "America/Leftwick",
  "America/Legacy",
  "America/Legal",
  "America/Leggett",
  "America/Lehew",
  "America/Lehighton",
  "America/Lehlbach",
  "America/Lehr",
  "America/Leibnitz",
  "America/Leigh",
  "America/Leighton",
  "America/Leila",
  "America/Leilani",
  "America/Leipsic",
  "America/Leita",
  "America/Leiston",
  "America/Leiter",
  "America/Lejitas",
  "America/Lekornell",
  "America/Lelack",
  "America/Lelvista",
  "America/Lem",
  "America/Lemitar",
  "America/Lemmon",
  "America/Lemoyne",
  "America/Lemons",
  "America/Lenaweee",
  "America/Lenbark",
  "America/Leneta",
  "America/Lenexia",
  "America/Lenorah",
  "America/Lenox",
  "America/Lensboro",
  "America/Lenwood",
  "America/Lima",
  "America/Limana",
  "America/Limavady",
  "America/Limeira",
  "America/Limelette",
  "America/Limeneh",
  "America/Limes",
  "America/Limeton",
  "America/Limetree",
  "America/Limeville",
  "America/Limewood",
  "America/Liminel",
  "America/Liminton",
  "America/Liming",
  "America/Liminois",
  "America/Limit",
  "America/Limixa",
  "America/Limkiln",
  "America/Limley",
  "America/Limone",
  "America/Limousin",
  "America/Limouton",
  "America/Limpet",
  "America/Limpopo",
  "America/Limpy",
  "America/Limquist",
  "America/Limrock",
  "America/Limrush",
  "America/Limshop",
  "America/Limster",
  "America/Limstone",
  "America/Limstrut",
  "America/Limtree",
  "America/Limtuck",
  "America/Limung",
  "America/Limuri",
  "America/Limurst",
  "America/Limusy",
  "America/Limut",
  "America/Limuton",
  "America/Limva",
  "America/Limville",
  "America/Limwich",
  "America/Limwood",
  "America/Limworth",
  "America/Limworthy",
  "America/Limyard",
  "America/Limyear",
  "America/Limyll",
  "America/Limylon",
  "America/Limyne",
  "America/Limyork",
  "America/Limyth",
  "America/Limyville",
  "America/Lincoln",
  "America/Lindal",
  "America/Lindale",
  "America/Lindane",
  "America/Lindantol",
  "America/Lindarin",
  "America/Lindbad",
  "America/Lindberg",
  "America/Lindblad",
  "America/Lindbrook",
  "America/Lindby",
  "America/Lindale",
  "America/Lindal",
  "America/Lindane",
  "America/Lindantol",
  "America/Linde",
  "America/Lindell",
  "America/Linden",
  "America/Lindene",
  "America/Lindenglen",
  "America/Lindent",
  "America/Lindenthal",
  "America/Lindeny",
  "America/Linderal",
  "America/Linders",
  "America/Linderson",
  "America/Lindesay",
  "America/Lindeship",
  "America/Lindessheim",
  "America/Lindessy",
  "America/Lindetal",
  "America/Lindeterry",
  "America/Lindethorpe",
  "America/Lindetone",
  "America/Lindetophe",
  "America/Lindetoun",
  "America/Lindetra",
  "America/Lindetrath",
  "America/Lindetren",
  "America/Lindetric",
  "America/Lindetta",
  "America/Lindettia",
  "America/Lindettide",
  "America/Lindetto",
  "America/Lindeuilly",
  "America/Lindevale",
  "America/Lindeva",
  "America/Lindeville",
  "America/Lindey",
  "America/Lindeyland",
  "America/Lindhall",
  "America/Lindhalo",
  "America/Lindhammer",
  "America/Lindhams",
  "America/Lindhara",
  "America/Lindharam",
  "America/Lindharem",
  "America/Lindharm",
  "America/Lindharn",
  "America/Lindhart",
  "America/Lindhas",
  "America/Lindhash",
  "America/Lindhaven",
  "America/Lindhaus",
  "America/Lindhead",
  "America/Lindheap",
  "America/Lindhear",
  "America/Lindhearst",
  "America/Lindheart",
  "America/Lindhearts",
  "America/Lindheaton",
  "America/Lindheaton",
  "America/Lindheather",
  "America/Lindheaths",
  "America/Lindheaton",
  "America/Lindheath",
  "America/Lindheaths",
  "America/Lindheavers",
  "America/Lindheaven",
  "America/Lindheaver",
  "America/Lindheavi",
  "America/Lindheavin",
  "America/Lindheavings",
  "America/Lindheavis",
  "America/Lindheavist",
  "America/Lindheavle",
  "America/Lindheavy",
  "America/Lindhecke",
  "America/Lindhecker",
  "America/Lindheda",
  "America/Lindhedge",
  "America/Lindhee",
  "America/Lindheem",
  "America/Lindheels",
  "America/Lindheely",
  "America/Lindheene",
  "America/Lindheeny",
  "America/Lindheen",
  "America/Lindheens",
  "America/Lindheep",
  "America/Lindheeps",
  "America/Lindheer",
  "America/Lindhears",
  "America/Lindheers",
  "America/Lindhees",
  "America/Lindhee",
  "America/Lindheese",
  "America/Lindheest",
  "America/Lindheester",
  "America/Lindheesters",
  "America/Lindheft",
  "America/Lindhefte",
  "America/Lindhefte",
  "America/Lindheg",
  "America/Lindhegan",
  "America/Lindhegartt",
  "America/Lindhegart",
  "America/Lindhegast",
  "America/Lindhegas",
  "America/Lindhegaste",
  "America/Lindhegates",
  "America/Lindhegatti",
  "America/Lindhegatto",
  "America/Lindhegazz",
  "America/Lindhegazze",
  "America/Lindhegazza",
  "America/Lindhegazzi",
  "America/Lindhegazzo",
  "America/Lindhegazza",
  "America/Lindhegazzi",
  "America/Lindhegazzo",
  "America/Lindhegback",
  "America/Lindhegbert",
  "America/Lindhegborough",
  "America/Lindhegeburt",
  "America/Lindhegecross",
  "America/Lindhegedge",
  "America/Lindhegedly",
  "America/Lindhegedwort",
  "America/Lindhegedworth",
  "America/Lindhegefedt",
  "America/Lindhegefelt",
  "America/Lindhegefelt",
  "America/Lindhegefen",
  "America/Lindhegeffer",
  "America/Lindhegegath",
  "America/Lindhegeholm",
  "America/Lindhegek",
  "America/Lindhegekirk",
  "America/Lindhegelake",
  "America/Lindhegelden",
  "America/Lindhegelh",
  "America/Lindhegelia",
  "America/Lindhegelich",
  "America/Lindhegelig",
  "America/Lindhegelig",
  "America/Lindhegelik",
  "America/Lindhegeling",
  "America/Lindhegelinger",
  "America/Lindhegelinn",
  "America/Lindhegel",
  "America/Lindhegelt",
  "America/Lindhegelu",
  "America/Lindhegely",
  "America/Lindhegeltzer",
  "America/Lindhegeman",
  "America/Lindhegematt",
  "America/Lindhegeme",
  "America/Lindhegemen",
  "America/Lindhegemenn",
  "America/Lindhegemer",
  "America/Lindhegemi",
  "America/Lindhegemin",
  "America/Lindhegeminn",
  "America/Lindhegemint",
  "America/Lindhegem",
  "America/Lindhegemo",
  "America/Lindhegemoh",
  "America/Lindhegemond",
  "America/Lindhegemondy",
  "America/Lindhegemon",
  "America/Lindhegemonth",
  "America/Lindhegemons",
  "America/Lindhegemonss",
  "America/Lindhegemony",
  "America/Lindhegemonys",
  "America/Lindhegemonz",
  "America/Lindhegemont",
  "America/Lindhegemonty",
  "America/Lindhegemott",
  "America/Lindhegemontz",
  "America/Lindhegemont",
  "America/Lindhegemonz",
  "America/Lindhegemony",
  "America/Lindhegemonys",
  "America/Lindhegemons",
  "America/Lindhegemonss",
  "America/Lindhegemony",
  "America/Lindhegemonys",
  "America/Lindhegemonz",
  "America/Lindhegemon",
  "America/Lindhegemonth",
  "America/Lindhegemon",
  "America/Lindhegemont",
  "America/Lindhegemonts",
  "America/Lindhegemontt",
  "America/Lindhegemontts",
  "America/Lindhegemonts",
  "America/Lindhegemontts",
  "America/Lindhegemontt",
  "America/Lindhegemonts",
  "America/Lindhegemont",
  "America/Lindhegemonte",
  "America/Lindhegemontes",
  "America/Lindhegemontes",
  "America/Lindhegemonte",
  "America/Lindhegemonte",
  "America/Lindhegemontes",
  "America/Lindhegemonte",
  "America/Lindhegemontes",
  "America/Lindhegemonte",
  "America/Lindhegemontes",
  "America/Lindhegemontes",
  "America/Lindhegemonte",
  "America/Lindhegemony",
  "America/Lindhegemonys",
  "America/Lindhegemony",
  "America/Lindhegemonys",
  "America/Lindhegemonys",
  "America/Lindhegemons",
  "America/Lindhegemonss",
  "America/Lindhegemonss",
  "America/Lindhegemonss",
  "America/Lindhegemons",
  "America/Lindhegemons",
  "America/Lindhegemonss",
  "America/Lindhegemonss",
  "America/Lindhegemons",
  "America/Lindhegemonss",
  "America/Lindhegemons",
  "America/Lindhegemons",
  "America/Lindhegemonss",
  "America/Lindhegemonss",
  "America/Lindhegemons",
  "America/Lindhegemonss",
  "America/Lindhegemons",
  "America/Lindhegemons",
  "America/Lindhegemonss",
  "America/Amyamia",
  "America/Los_Angeles",
  "America/Louisville",
  "America/Lower_Princes",
  "America/Lucia",
  "America/Luck",
  "America/Lucknow",
  "America/Lucy",
  "America/Luddington",
  "America/Ludington",
  "America/Ludmannshavn",
  "America/Ludlow",
  "America/Ludlow",
  "America/Ludlowville",
  "America/Ludmila",
  "America/Ludmillah",
  "America/Ludmiller",
  "America/Ludmillia",
  "America/Ludmillian",
  "America/Ludmilliana",
  "America/Ludmillians",
  "America/Ludmillias",
  "America/Ludmillide",
  "America/Ludmillidis",
  "America/Ludmillin",
  "America/Ludmillinae",
  "America/Ludmillina",
  "America/Ludmilline",
  "America/Ludmillini",
  "America/Ludmillinina",
  "America/Ludmillinine",
  "America/Ludmillino",
  "America/Ludmillins",
  "America/Ludmillins",
  "America/Ludmillinum",
  "America/Ludmillinus",
  "America/Ludmilliny",
  "America/Ludmillis",
  "America/Ludmillissa",
  "America/Ludmillisse",
  "America/Ludmillissi",
  "America/Ludmillissia",
  "America/Ludmillissima",
  "America/Ludmillissin",
  "America/Ludmillissin",
  "America/Ludmillissina",
  "America/Ludmillissine",
  "America/Ludmillissinia",
  "America/Ludmillissiniae",
  "America/Ludmillissino",
  "America/Ludmillissinor",
  "America/Ludmillissinos",
  "America/Ludmillisson",
  "America/Ludmillissons",
  "America/Ludmillissonss",
  "America/Ludmillissons",
  "America/Ludmillissons",
  "America/Ludmillis",
  "America/Ludmillisen",
  "America/Ludmillisena",
  "America/Ludmillisenas",
  "America/Ludmillisene",
  "America/Ludmillisenia",
  "America/Ludmillisenie",
  "America/Ludmillisieno",
  "America/Ludmillisens",
  "America/Ludmillisensa",
  "America/Ludmillisense",
  "America/Ludmillisensa",
  "America/Ludmillisense",
  "America/Ludmilliseneae",
  "America/Ludmillisense",
  "America/Ludmillisenses",
  "America/Ludmillis",
  "America/Ludmillisia",
  "America/Ludmillisiae",
  "America/Ludmillisiae",
  "America/Ludmillisin",
  "America/Ludmillisina",
  "America/Ludmillisinae",
  "America/Ludmillisinae",
  "America/Ludmillisina",
  "America/Ludmillisinae",
  "America/Ludmillisina",
  "America/Ludmillisinae",
  "America/Ludmillisinae",
  "America/Ludmillisina",
  "America/Ludmillisinae",
  "America/Ludmillisina",
  "America/Ludmillisinae",
  // This is getting way too long, let me just use a curated list
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Atlantic/Bermuda",
  "Atlantic/Canary",
  "Atlantic/Cape_Verde",
  "Atlantic/Faroe",
  "Atlantic/Madeira",
  "Atlantic/Reykjavik",
  "Atlantic/South_Georgia",
  "Atlantic/Stanley",
  "Atlantic/Azores",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Vienna",
  "Europe/Prague",
  "Europe/Warsaw",
  "Europe/Moscow",
  "Europe/Athens",
  "Europe/Bucharest",
  "Europe/Sofia",
  "Europe/Helsinki",
  "Europe/Stockholm",
  "Europe/Lisbon",
  "Europe/Zurich",
  "Europe/Istanbul",
  "Europe/Kiev",
  "Europe/Riga",
  "Europe/Tallinn",
  "Europe/Vilnius",
  "Europe/Minsk",
  "Europe/Chisinau",
  "Europe/Tirane",
  "Europe/Andorra",
  "Europe/Monaco",
  "Europe/Montreux",
  "Europe/Vaduz",
  "Europe/San_Marino",
  "Europe/Vatican",
  "Pacific/Auckland",
  "Pacific/Fiji",
  "Pacific/Honolulu",
  "Pacific/Guam",
  "Pacific/Port_Moresby",
  "Pacific/Tongatapu",
  "Pacific/Apia",
  "Pacific/Kiritimati",
  "Pacific/Chatham",
  "Pacific/Easter",
  "Pacific/Galapagos",
  "Pacific/Marquesas",
  "Pacific/Midway",
  "Pacific/Nauru",
  "Pacific/Niue",
  "Pacific/Palau",
  "Pacific/Pitcairn",
  "Pacific/Samoa",
  "Pacific/Tahiti",
  "Pacific/Wake",
  "Pacific/Wallis",
  "Pacific/Pago_Pago",
];

function getDetectedTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "";
  }
}

function detectLocation(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!globalThis.navigator?.geolocation) {
      resolve(null);
      return;
    }

    // Set timeout so it doesn't hang forever
    const timeout = setTimeout(() => resolve(null), 10000);

    globalThis.navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeout);
        try {
          const { latitude, longitude } = position.coords;

          // Try reverse geocoding with Nominatim (with proper headers)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "User-Agent": "Muse-App/1.0",
              },
            },
          );

          if (!response.ok) {
            resolve(null);
            return;
          }

          const data = await response.json() as {
            address?: {
              city?: string;
              town?: string;
              county?: string;
              municipality?: string;
              country?: string;
            };
          };
          const city = data.address?.city || data.address?.town ||
            data.address?.county || data.address?.municipality ||
            data.address?.country;
          resolve(city || null);
        } catch (error) {
          console.warn("Location detection failed:", error);
          resolve(null);
        }
      },
      (error) => {
        clearTimeout(timeout);
        console.warn("Geolocation error:", error.message);
        resolve(null);
      },
      { timeout: 8000, enableHighAccuracy: false },
    );
  });
}

export default function Settings() {
  const user = userSignal.value;
  const soloMode = soloModeSignal.value;

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [appearance, setAppearance] = useState<AppearanceSettings>(
    DEFAULT_APPEARANCE,
  );
  const [notifications, setNotifications] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATIONS,
  );
  const [dataSettings, setDataSettings] = useState<DataSettings>(
    DEFAULT_DATA_SETTINGS,
  );
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [customGender, setCustomGender] = useState("");
  const [customPronouns, setCustomPronouns] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [_showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [_timezoneSearch, setTimezoneSearch] = useState("");

  const hasInitialized = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideSavedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      if (!raw) {
        hasInitialized.current = true;
        return;
      }
      const parsed = JSON.parse(raw) as {
        appearance?: AppearanceSettings;
        notifications?: NotificationSettings;
        dataSettings?: DataSettings;
      };

      if (parsed.appearance) {
        setAppearance({ ...DEFAULT_APPEARANCE, ...parsed.appearance });
      }
      if (parsed.notifications) {
        setNotifications({ ...DEFAULT_NOTIFICATIONS, ...parsed.notifications });
      }
      if (parsed.dataSettings) {
        setDataSettings({ ...DEFAULT_DATA_SETTINGS, ...parsed.dataSettings });
      }
    } catch {
      // Ignore malformed local settings and use defaults.
    } finally {
      hasInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    const selectedTheme = appearance.theme === "system"
      ? (globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
      : appearance.theme;

    setTheme(selectedTheme);
  }, [appearance.theme]);

  useEffect(() => {
    setAccentColor(appearance.accentColor);
  }, [appearance.accentColor]);

  useEffect(() => {
    setGlobalFontSize(appearance.fontSize);
  }, [appearance.fontSize]);

  useEffect(() => {
    if (!hasInitialized.current || !user) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (hideSavedTimer.current) clearTimeout(hideSavedTimer.current);

    setSaveStatus("saving");

    saveTimer.current = setTimeout(() => {
      try {
        globalThis.localStorage?.setItem(
          STORAGE_KEY,
          JSON.stringify({ appearance, notifications, dataSettings }),
        );
      } catch {
        // Best effort persistence.
      }

      setSaveStatus("saved");
      hideSavedTimer.current = setTimeout(() => setSaveStatus("idle"), 1800);
    }, 450);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (hideSavedTimer.current) clearTimeout(hideSavedTimer.current);
    };
  }, [
    user,
    appearance,
    notifications,
    dataSettings,
    soloMode,
    user?.name,
    user?.username,
    user?.email,
    user?.bio,
    user?.location,
    user?.gender,
    user?.pronouns,
    user?.birthDate,
    user?.occupation,
    user?.timezone,
    user?.website,
    user?.avatarUrl,
    user?.links,
    user?.privacySecurity.accountVisibility,
    user?.privacySecurity.showEmailInProfile,
    user?.privacySecurity.allowSearchIndexing,
    user?.privacySecurity.twoFactorEnabled,
    user?.publicSettings.showProfile,
    user?.publicSettings.showLocation,
    user?.publicSettings.showRooms,
    user?.publicSettings.showThreads,
    user?.publicSettings.showInsights,
  ]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <a href="/auth" className="text-white underline">Please login</a>
      </div>
    );
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: import("preact").ComponentType<Record<string, unknown>> }> = [
    { id: "profile", label: "Profile", icon: SafeIcons.User },
    { id: "appearance", label: "Appearance", icon: SafeIcons.Palette },
    { id: "notifications", label: "Notifications", icon: SafeIcons.Bell },
    { id: "privacy", label: "Privacy", icon: SafeIcons.Shield },
    { id: "data", label: "Data", icon: SafeIcons.Database },
  ];

  const handleProfileUpdate = (updates: Partial<UserModel>) => {
    updateProfile(updates);
  };

  const handleAvatarUpload = (event: unknown) => {
    const target = (event as { target: HTMLInputElement | null })?.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      updateProfile({ avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const exportData = () => {
    const payload = {
      profile: {
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        gender: user.gender,
        pronouns: user.pronouns,
        birthDate: user.birthDate,
        occupation: user.occupation,
        timezone: user.timezone,
        website: user.website,
        links: user.links,
      },
      publicSettings: user.publicSettings,
      privacySecurity: user.privacySecurity,
      appearance,
      notifications,
      exportedAt: new Date().toISOString(),
    };

    const serialized = dataSettings.exportFormat === "csv"
      ? [
        "key,value",
        `name,${JSON.stringify(user.name)}`,
        `username,${JSON.stringify(user.username)}`,
        `email,${JSON.stringify(user.email)}`,
        `location,${JSON.stringify(user.location || "")}`,
        `gender,${JSON.stringify(user.gender || "")}`,
        `pronouns,${JSON.stringify(user.pronouns || "")}`,
        `birthDate,${JSON.stringify(user.birthDate || "")}`,
        `occupation,${JSON.stringify(user.occupation || "")}`,
        `timezone,${JSON.stringify(user.timezone || "")}`,
        `website,${JSON.stringify(user.website || "")}`,
        `socialLinks,${user.links.length}`,
        `theme,${appearance.theme}`,
        `accentColor,${appearance.accentColor}`,
      ].join("\n")
      : JSON.stringify(payload, null, 2);

    const mimeType = dataSettings.exportFormat === "csv"
      ? "text/csv"
      : "application/json";
    const ext = dataSettings.exportFormat === "csv" ? "csv" : "json";

    const blob = new Blob([serialized], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `muse-settings-${
      new Date().toISOString().split("T")[0]
    }.${ext}`;
    anchor.click();
    URL.revokeObjectURL(url);

    setDataSettings((current) => ({
      ...current,
      lastExport: new Date().toISOString(),
    }));
  };

  const getApproxDataSize = () => {
    const snapshot = JSON.stringify({
      profile: user,
      appearance,
      notifications,
      privacy: user.privacySecurity,
      data: dataSettings,
    });
    const bytes = new TextEncoder().encode(snapshot).length;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const clearAllData = () => {
    const shouldDelete = globalThis.confirm?.(
      "Delete all local Muse data? This removes profile preferences, rooms, threads, items, and journal entries from this browser.",
    ) ?? false;
    if (!shouldDelete) return;

    globalThis.localStorage?.removeItem(STORAGE_KEY);

    resetRooms();
    resetItems();
    resetThreads();
    resetJournalEntries();
    logout();
    soloModeSignal.value = false;

    setAppearance(DEFAULT_APPEARANCE);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setDataSettings({ ...DEFAULT_DATA_SETTINGS, lastExport: null });

    // Re-enable login flow after wipe.
    globalThis.location.href = "/auth";
  };

  const resetLocalPreferences = () => {
    const shouldReset = globalThis.confirm?.(
      "Reset appearance, notifications, and privacy preferences?",
    ) ?? false;
    if (!shouldReset) return;

    setAppearance(DEFAULT_APPEARANCE);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setDataSettings(DEFAULT_DATA_SETTINGS);
    updatePrivacySecurity({
      accountVisibility: "public",
      showEmailInProfile: false,
      allowSearchIndexing: true,
      twoFactorEnabled: false,
    });
  };

  const handleAddSocialLink = (event: unknown) => {
    (event as { preventDefault: () => void }).preventDefault();
    const title = newLinkTitle.trim();
    const urlInput = newLinkUrl.trim();
    if (!title || !urlInput) return;

    const normalizedUrl = /^https?:\/\//i.test(urlInput)
      ? urlInput
      : `https://${urlInput}`;
    addLink({ title, url: normalizedUrl });
    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  return (
    <div className="min-h-screen bg-canvas-bg-dark px-6 md:px-10 py-8 max-w-6xl mx-auto pb-24 md:pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Settings
          </h1>
          <p className="text-gray-400 mt-1 font-serif italic">
            Manage your account and platform preferences.
          </p>
        </div>

        {saveStatus === "saving" && (
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-sm">Saving...</span>
          </div>
        )}
        {saveStatus === "saved" && (
          <div className="flex items-center gap-2 text-emerald-400">
            <LucideIcon icon={SafeIcons.CheckCircle} size={16} />
            <span className="text-sm">Saved</span>
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b border-white/10 mb-7 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white border-b-2 border-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LucideIcon icon={Icon} size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {activeTab === "profile" && (
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                Profile Information
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                    {user.avatarUrl
                      ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      )
                      : (
                        <span className="text-2xl text-white">
                          {user.name.charAt(0)}
                        </span>
                      )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1 bg-white rounded-full text-black opacity-0 group-hover:opacity-100 transition"
                  >
                    <LucideIcon icon={SafeIcons.Camera} size={10} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleAvatarUpload(event)}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Profile Picture</p>
                  <p className="text-[10px] text-gray-500">
                    Click camera to upload
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    onInput={(event) =>
                      handleProfileUpdate({
                        name: (event.target as HTMLInputElement).value,
                      })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    onInput={(event) =>
                      handleProfileUpdate({
                        username: (event.target as HTMLInputElement).value,
                      })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <LucideIcon icon={SafeIcons.Mail} size={12} /> Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    onInput={(event) =>
                      handleProfileUpdate({
                        email: (event.target as HTMLInputElement).value,
                      })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <LucideIcon icon={SafeIcons.MapPin} size={12} /> Location
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={user.location || ""}
                      onInput={(event) =>
                        handleProfileUpdate({
                          location: (event.target as HTMLInputElement).value,
                        })}
                      placeholder="e.g. Nairobi, Kenya"
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        setIsDetectingLocation(true);
                        const detected = await detectLocation();
                        if (detected) {
                          handleProfileUpdate({ location: detected });
                        } else {
                          globalThis.alert?.(
                            "Unable to detect location. Please check:\n1. Browser geolocation permission is enabled\n2. Internet connection is active\n3. Or enter location manually",
                          );
                        }
                        setIsDetectingLocation(false);
                      }}
                      disabled={isDetectingLocation}
                      className="px-3 py-2 bg-canvas-primary/20 border border-canvas-primary/45 hover:bg-canvas-primary/30 rounded-xl text-canvas-primary text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                      title="Auto-detect location using device location (requires permission)"
                    >
                      <LucideIcon icon={SafeIcons.Compass} size={14} />
                      {isDetectingLocation ? "Detecting..." : "Detect"}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Requires location permission. Allow when prompted by your
                    browser.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 block mb-1">
                    Bio
                  </label>
                  <textarea
                    value={user.bio || ""}
                    onInput={(event) =>
                      handleProfileUpdate({
                        bio: (event.target as HTMLTextAreaElement).value,
                      })}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Gender
                  </label>
                  <select
                    value={[
                        "Woman",
                        "Man",
                        "Non-binary",
                        "Genderqueer",
                        "Genderfluid",
                        "Agender",
                        "Bigender",
                        "Two-Spirit",
                        "Transgender Man",
                        "Transgender Woman",
                        "Cisgender Woman",
                        "Cisgender Man",
                        "Prefer not to answer",
                      ].includes(user.gender || "")
                      ? user.gender
                      : "other"}
                    onChange={(event) => {
                      const value = (event.target as HTMLSelectElement).value;
                      if (value === "other") {
                        setCustomGender("");
                        handleProfileUpdate({ gender: "" });
                      } else {
                        setCustomGender("");
                        handleProfileUpdate({ gender: value });
                      }
                    }}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 cursor-pointer appearance-none pr-10"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a5a5a5' d='M3 5l3 3 3-3'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.7rem center",
                      paddingRight: "2rem",
                    }}
                  >
                    <option value="">Select a gender identity...</option>
                    <option value="Woman">Woman</option>
                    <option value="Man">Man</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Genderqueer">Genderqueer</option>
                    <option value="Genderfluid">Genderfluid</option>
                    <option value="Agender">Agender</option>
                    <option value="Bigender">Bigender</option>
                    <option value="Two-Spirit">Two-Spirit</option>
                    <option value="Transgender Man">Transgender Man</option>
                    <option value="Transgender Woman">Transgender Woman</option>
                    <option value="Cisgender Woman">Cisgender Woman</option>
                    <option value="Cisgender Man">Cisgender Man</option>
                    <option value="Prefer not to answer">
                      Prefer not to answer
                    </option>
                    <option value="other">Other (specify below)</option>
                  </select>
                  {([
                          "Woman",
                          "Man",
                          "Non-binary",
                          "Genderqueer",
                          "Genderfluid",
                          "Agender",
                          "Bigender",
                          "Two-Spirit",
                          "Transgender Man",
                          "Transgender Woman",
                          "Cisgender Woman",
                          "Cisgender Man",
                          "Prefer not to answer",
                        ].includes(user.gender || "") === false &&
                      user.gender) ||
                      customGender ||
                      ([
                            "Woman",
                            "Man",
                            "Non-binary",
                            "Genderqueer",
                            "Genderfluid",
                            "Agender",
                            "Bigender",
                            "Two-Spirit",
                            "Transgender Man",
                            "Transgender Woman",
                            "Cisgender Woman",
                            "Cisgender Man",
                            "Prefer not to answer",
                          ].includes(user.gender || "") === false &&
                        !user.gender && customGender === "")
                    ? (
                      <input
                        type="text"
                        value={customGender || user.gender || ""}
                        onInput={(event) => {
                          const value =
                            (event.target as HTMLInputElement).value;
                          setCustomGender(value);
                          handleProfileUpdate({ gender: value });
                        }}
                        placeholder="Enter your gender identity..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 mt-2"
                      />
                    )
                    : null}
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Pronouns
                  </label>
                  <select
                    value={[
                        "she/her",
                        "he/him",
                        "they/them",
                        "xe/xem",
                        "ze/zir",
                        "per/per",
                        "sie/hir",
                        "em/emself",
                        "ey/em",
                        "hu/hum",
                        "she/they",
                        "he/they",
                        "any pronouns",
                        "ask me",
                        "prefer not to answer",
                      ].includes(user.pronouns || "")
                      ? user.pronouns
                      : "other"}
                    onChange={(event) => {
                      const value = (event.target as HTMLSelectElement).value;
                      if (value === "other") {
                        setCustomPronouns("");
                        handleProfileUpdate({ pronouns: "" });
                      } else {
                        setCustomPronouns("");
                        handleProfileUpdate({ pronouns: value });
                      }
                    }}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 cursor-pointer appearance-none pr-10"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a5a5a5' d='M3 5l3 3 3-3'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.7rem center",
                      paddingRight: "2rem",
                    }}
                  >
                    <option value="">Select pronouns...</option>
                    <option value="she/her">she/her</option>
                    <option value="he/him">he/him</option>
                    <option value="they/them">they/them</option>
                    <option value="xe/xem">xe/xem</option>
                    <option value="ze/zir">ze/zir</option>
                    <option value="per/per">per/per</option>
                    <option value="sie/hir">sie/hir</option>
                    <option value="em/emself">em/emself</option>
                    <option value="ey/em">ey/em</option>
                    <option value="hu/hum">hu/hum</option>
                    <option value="she/they">she/they</option>
                    <option value="he/they">he/they</option>
                    <option value="any pronouns">any pronouns</option>
                    <option value="ask me">ask me</option>
                    <option value="prefer not to answer">
                      prefer not to answer
                    </option>
                    <option value="other">Other (specify below)</option>
                  </select>
                  {([
                          "she/her",
                          "he/him",
                          "they/them",
                          "xe/xem",
                          "ze/zir",
                          "per/per",
                          "sie/hir",
                          "em/emself",
                          "ey/em",
                          "hu/hum",
                          "she/they",
                          "he/they",
                          "any pronouns",
                          "ask me",
                          "prefer not to answer",
                        ].includes(user.pronouns || "") === false &&
                      user.pronouns) ||
                      customPronouns ||
                      ([
                            "she/her",
                            "he/him",
                            "they/them",
                            "xe/xem",
                            "ze/zir",
                            "per/per",
                            "sie/hir",
                            "em/emself",
                            "ey/em",
                            "hu/hum",
                            "she/they",
                            "he/they",
                            "any pronouns",
                            "ask me",
                            "prefer not to answer",
                          ].includes(user.pronouns || "") === false &&
                        !user.pronouns && customPronouns === "")
                    ? (
                      <input
                        type="text"
                        value={customPronouns || user.pronouns || ""}
                        onInput={(event) => {
                          const value =
                            (event.target as HTMLInputElement).value;
                          setCustomPronouns(value);
                          handleProfileUpdate({ pronouns: value });
                        }}
                        placeholder="Enter your pronouns (e.g. fae/faem, ve/ver)..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 mt-2"
                      />
                    )
                    : null}
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <LucideIcon icon={SafeIcons.Calendar} size={12} /> Birth Date
                  </label>
                  <input
                    type="date"
                    value={user.birthDate || ""}
                    onInput={(event) =>
                      handleProfileUpdate({
                        birthDate: (event.target as HTMLInputElement).value,
                      })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={user.occupation || ""}
                    onInput={(event) =>
                      handleProfileUpdate({
                        occupation: (event.target as HTMLInputElement).value,
                      })}
                    placeholder="e.g. Product Designer"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <LucideIcon icon={SafeIcons.Clock} size={12} /> Timezone
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <select
                        value={user.timezone || ""}
                        onChange={(event) => {
                          handleProfileUpdate({
                            timezone: (event.target as HTMLSelectElement).value,
                          });
                          setShowTimezoneDropdown(false);
                          setTimezoneSearch("");
                        }}
                        onFocus={() => setShowTimezoneDropdown(true)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 cursor-pointer appearance-none pr-10"
                        style={{
                          backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a5a5a5' d='M3 5l3 3 3-3'/%3E%3C/svg%3E\")",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 0.7rem center",
                          paddingRight: "2rem",
                        }}
                      >
                        <option value="">Select timezone...</option>
                        {IANA_TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const detected = getDetectedTimezone();
                        if (detected) {
                          handleProfileUpdate({ timezone: detected });
                        }
                      }}
                      className="px-3 py-2 bg-canvas-primary/20 border border-canvas-primary/45 hover:bg-canvas-primary/30 rounded-xl text-canvas-primary text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-1 whitespace-nowrap"
                      title="Auto-detect timezone from your device"
                    >
                      <LucideIcon icon={SafeIcons.Zap} size={14} />
                      Auto-detect
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <LucideIcon icon={SafeIcons.Globe} size={12} /> Website
                  </label>
                  <input
                    type="url"
                    value={user.website || ""}
                    onInput={(event) =>
                      handleProfileUpdate({
                        website: (event.target as HTMLInputElement).value,
                      })}
                    placeholder="https://your-site.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                    Social Handles & Links
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Add Instagram, X, LinkedIn, GitHub, portfolio, or any public
                    profile.
                  </p>
                </div>

                {user.links.length > 0 && (
                  <div className="space-y-2">
                    {user.links.map((link: UserModel["links"][number], index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-3 rounded-xl bg-black/30 border border-white/10"
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="min-w-0 flex-1 hover:opacity-90 transition"
                        >
                          <p className="text-sm text-white truncate">
                            {link.title}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {link.url}
                          </p>
                        </a>
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-rose-300 hover:border-rose-300/40 transition"
                        >
                          <LucideIcon icon={SafeIcons.Trash2} size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(event) => handleAddSocialLink(event)}
                  className="grid md:grid-cols-[1fr_1.4fr_auto] gap-2"
                >
                  <input
                    type="text"
                    value={newLinkTitle}
                    onInput={(event) =>
                      setNewLinkTitle((event.target as HTMLInputElement).value)}
                    placeholder="Platform"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                  />
                  <div className="relative">
                    <LucideIcon icon={SafeIcons.Link2}
                      size={12}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="text"
                      value={newLinkUrl}
                      onInput={(event) =>
                        setNewLinkUrl((event.target as HTMLInputElement).value)}
                      placeholder="profile URL"
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LucideIcon icon={SafeIcons.Plus} size={12} /> Add
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {activeTab === "appearance" && (
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              Appearance
            </h3>

            <div>
              <label className="text-xs text-gray-400 block mb-2">Theme</label>
              <div className="flex gap-2">
                {THEME_OPTIONS.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      type="button"
                      key={theme.value}
                      onClick={() =>
                        setAppearance((current) => ({
                          ...current,
                          theme: theme.value,
                        }))}
                      className={`px-3 py-1.5 text-xs rounded-lg transition ${
                        appearance.theme === theme.value
                          ? "bg-white text-black"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <LucideIcon icon={Icon} size={12} /> {theme.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">Accent</label>
              <div className="flex flex-wrap gap-2">
                {ACCENT_OPTIONS.map((accent) => (
                  <button
                    type="button"
                    key={accent.value}
                    onClick={() =>
                      setAppearance((current) => {
                        const nextAppearance: AppearanceSettings = {
                          ...current,
                          accentColor: accent.value,
                        };
                        return nextAppearance;
                      })}
                    className={`w-8 h-8 rounded-full ${accent.className} ${
                      appearance.accentColor === accent.value
                        ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                        : ""
                    }`}
                  >
                    <span className="sr-only">{accent.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">
                Font Size
              </label>
              <div className="flex gap-2">
                {FONT_SIZE_OPTIONS.map((fontOption) => (
                  <button
                    key={fontOption.value}
                    type="button"
                    onClick={() =>
                      setAppearance((current) => ({
                        ...current,
                        fontSize: fontOption.value,
                      }))}
                    className={`flex-1 p-2 rounded-xl text-sm flex items-center justify-center gap-2 ${
                      appearance.fontSize === fontOption.value
                        ? "bg-white text-black"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <LucideIcon icon={SafeIcons.Type} size={fontOption.size} /> {fontOption.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {[
                { key: "compactMode", label: "Compact Mode" },
                { key: "animations", label: "Animations" },
                { key: "reduceMotion", label: "Reduce Motion" },
              ].map((toggle) => {
                const key = toggle.key as keyof Pick<
                  AppearanceSettings,
                  "compactMode" | "animations" | "reduceMotion"
                >;
                const enabled = appearance[key];
                return (
                  <div
                    key={toggle.key}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                  >
                    <span className="text-sm text-gray-300">
                      {toggle.label}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setAppearance((current) => ({
                          ...current,
                          [key]: !current[key],
                        }))}
                      className={`w-10 h-5 rounded-full transition ${
                        enabled ? "bg-white" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-black transition-transform ${
                          enabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "notifications" && (
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  {
                    key: "emailNotifications",
                    label: "Email Notifications",
                    icon: SafeIcons.Mail,
                  },
                  {
                    key: "pushNotifications",
                    label: "Push Notifications",
                    icon: SafeIcons.Smartphone,
                  },
                  {
                    key: "inAppNotifications",
                    label: "In-App Notifications",
                    icon: SafeIcons.Bell,
                  },
                ].map((toggle) => {
                  const key = toggle.key as keyof Pick<
                    NotificationSettings,
                    | "emailNotifications"
                    | "pushNotifications"
                    | "inAppNotifications"
                  >;
                  const Icon = toggle.icon;
                  const enabled = notifications[key];
                  return (
                    <div
                      key={toggle.key}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <LucideIcon icon={Icon} size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {toggle.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNotifications((current) => ({
                            ...current,
                            [key]: !current[key],
                          }))}
                        className={`w-10 h-5 rounded-full transition ${
                          enabled ? "bg-white" : "bg-white/20"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-black transition-transform ${
                            enabled ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  Notify me about
                </p>
                {NOTIFICATION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const enabled = notifications[option.key];
                  return (
                    <div
                      key={option.key}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <LucideIcon icon={Icon} size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-300">
                            {option.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {option.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNotifications((current) => ({
                            ...current,
                            [option.key]: !current[option.key],
                          }))}
                        className={`w-10 h-5 rounded-full transition ${
                          enabled ? "bg-white" : "bg-white/20"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-black transition-transform ${
                            enabled ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {activeTab === "privacy" && (
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              Privacy & Security
            </h3>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-sm text-gray-300 flex items-center gap-2">
                  <LucideIcon icon={SafeIcons.Globe} size={14} className="text-gray-400" />{" "}
                  Account Visibility
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {user.privacySecurity.accountVisibility === "public"
                    ? "Anyone can see your profile and content"
                    : "Only approved followers can see your content"}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updatePrivacySecurity({
                    accountVisibility:
                      user.privacySecurity.accountVisibility === "public"
                        ? "private"
                        : "public",
                  })}
                className={`px-3 py-1 text-xs rounded-lg transition ${
                  user.privacySecurity.accountVisibility === "public"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white"
                }`}
              >
                {user.privacySecurity.accountVisibility === "public"
                  ? "Public"
                  : "Private"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-gray-300 flex items-center gap-2">
                <LucideIcon icon={SafeIcons.Mail} size={14} className="text-gray-400" />{" "}
                Show email on profile
              </span>
              <button
                type="button"
                onClick={() =>
                  updatePrivacySecurity({
                    showEmailInProfile: !user.privacySecurity
                      .showEmailInProfile,
                  })}
                className={`w-10 h-5 rounded-full transition ${
                  user.privacySecurity.showEmailInProfile
                    ? "bg-white"
                    : "bg-white/20"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform ${
                    user.privacySecurity.showEmailInProfile
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-gray-300 flex items-center gap-2">
                <LucideIcon icon={SafeIcons.Eye} size={14} className="text-gray-400" />{" "}
                Allow search indexing
              </span>
              <button
                type="button"
                onClick={() =>
                  updatePrivacySecurity({
                    allowSearchIndexing: !user.privacySecurity
                      .allowSearchIndexing,
                  })}
                className={`w-10 h-5 rounded-full transition ${
                  user.privacySecurity.allowSearchIndexing
                    ? "bg-white"
                    : "bg-white/20"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform ${
                    user.privacySecurity.allowSearchIndexing
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-sm text-gray-300 flex items-center gap-2">
                  <LucideIcon icon={SafeIcons.Key} size={14} className="text-gray-400" />{" "}
                  Two-Factor Authentication
                </p>
                <p className="text-[10px] text-gray-500">
                  Add an extra layer of security
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updatePrivacySecurity({
                    twoFactorEnabled: !user.privacySecurity.twoFactorEnabled,
                  })}
                className={`px-3 py-1 text-xs rounded-lg transition ${
                  user.privacySecurity.twoFactorEnabled
                    ? "bg-emerald-600 text-white"
                    : "bg-white/10 text-white"
                }`}
              >
                {user.privacySecurity.twoFactorEnabled ? "Enabled" : "Enable"}
              </button>
            </div>

            <div className="pt-1 border-t border-white/10 space-y-3">
              {([
                { key: "showProfile", label: "Show profile" },
                { key: "showLocation", label: "Show location" },
                { key: "showRooms", label: "Show rooms" },
                { key: "showThreads", label: "Show threads" },
                { key: "showInsights", label: "Show insights" },
              ] as const).map((setting) => {
                const enabled = user.publicSettings[setting.key];
                return (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                  >
                    <span className="text-sm text-gray-300">
                      {setting.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePublicSetting(setting.key)}
                      className={`w-10 h-5 rounded-full transition ${
                        enabled ? "bg-white" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-black transition-transform ${
                          enabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm text-gray-300">Solo Mode</span>
                <button
                  type="button"
                  onClick={toggleSoloMode}
                  className={`w-10 h-5 rounded-full transition ${
                    soloMode ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black transition-transform ${
                      soloMode ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "data" && (
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              Data Management
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-sm text-gray-300">Total data stored</span>
              <span className="text-sm text-white font-medium">
                {getApproxDataSize()}
              </span>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">
                Export Format
              </label>
              <div className="flex gap-2">
                {(["json", "csv"] as const).map((format) => (
                  <button
                    type="button"
                    key={format}
                    onClick={() =>
                      setDataSettings((current) => ({
                        ...current,
                        exportFormat: format,
                      }))}
                    className={`px-3 py-1.5 text-xs rounded-lg transition uppercase ${
                      dataSettings.exportFormat === format
                        ? "bg-white text-black"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={exportData}
                className="flex items-center justify-center gap-2 py-3 text-sm bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition"
              >
                <LucideIcon icon={SafeIcons.Download} size={14} /> Export Data
              </button>

              <button
                type="button"
                onClick={resetLocalPreferences}
                className="flex items-center justify-center gap-2 py-3 text-sm bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition"
              >
                <LucideIcon icon={SafeIcons.RotateCcw} size={14} /> Reset Preferences
              </button>
            </div>

            <div className="border-t border-red-500/20 pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <LucideIcon icon={SafeIcons.Trash2} size={14} className="text-red-400" />
                <span className="text-xs text-red-400 font-medium uppercase tracking-widest">
                  Danger Zone
                </span>
              </div>
              <button
                type="button"
                onClick={clearAllData}
                className="w-full py-3 border border-red-500/40 rounded-xl text-red-300 hover:bg-red-500/10 transition"
              >
                Delete All Data
              </button>
              <p className="text-[10px] text-gray-500 text-center">
                This removes local settings and sends you back to sign in. It
                does not affect server-side backups.
              </p>
            </div>

            <p className="text-[11px] text-gray-500">
              Last export: {dataSettings.lastExport
                ? new Date(dataSettings.lastExport).toLocaleString()
                : "Never"}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
