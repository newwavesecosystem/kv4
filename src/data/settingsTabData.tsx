import BellOnIcon from "~/components/icon/outline/BellOnIcon";
import LayoutIcon from "~/components/icon/outline/LayoutIcon";
import PeopleAppointmentIcon from "~/components/icon/outline/PeopleAppointmentIcon";
import PeopleIdCardVIcon from "~/components/icon/outline/PeopleIdCardVIcon";
import PeoplesIcon from "~/components/icon/outline/PeoplesIcon";
import SettingsIcon from "~/components/icon/outline/SettingsIcon";

const settingsTabData = [
  {
    id: 1,
    name: "Device Settings",
    icon: <SettingsIcon className="h-6 w-6" />,
    disable: false,
    auth: false,
    clickSourceId: 0,
  },
  {
    id: 2,
    name: "Notifications",
    icon: <BellOnIcon className="h-6 w-6" />,
    disable: false,
    auth: true,
    clickSourceId: 0,
  },
  {
    id: 3,
    name: "Layout",
    icon: <LayoutIcon className="h-6 w-6" />,
    disable: false,
    auth: true,
    clickSourceId: 0,
  },
  {
    id: 4,
    name: "Manage Users",
    icon: <PeoplesIcon className="h-6 w-6" />,
    disable: false,
    auth: true,
    clickSourceId: 0,
  },
  {
    id: 5,
    name: "Waiting Room",
    icon: <PeopleAppointmentIcon className="h-6 w-6" />,
    disable: false,
    auth: true,
    clickSourceId: 0,
  },
  {
    id: 6,
    name: "Take Spot Attendance",
    icon: <PeopleIdCardVIcon className="h-6 w-6" />,
    disable: false,
    auth: true,
    clickSourceId: 0,
  },
];

export default settingsTabData;
