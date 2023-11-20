const DummyChat = [
  {
    id: 1,
    name: "John Doe",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    time: getRandomTime(),
  },
  {
    id: 2,
    name: "Alice Johnson",
    message:
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    time: getRandomTime(),
  },
  {
    id: 3,
    name: "Bob Smith",
    message:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    time: getRandomTime(),
  },
  {
    id: 4,
    name: "Emily White",
    message:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    time: getRandomTime(),
  },
  {
    id: 5,
    name: "Daniel Brown",
    message:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    time: getRandomTime(),
  },
  {
    id: 6,
    name: "Sophia Davis",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    time: getRandomTime(),
  },
  {
    id: 7,
    name: "Michael Miller",
    message:
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    time: getRandomTime(),
  },
  {
    id: 8,
    name: "dev init",
    message:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    time: getRandomTime(),
  },
  {
    id: 9,
    name: "Ethan Taylor",
    message:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    time: getRandomTime(),
  },
  {
    id: 10,
    name: "Ava Martinez",
    message:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    time: getRandomTime(),
  },
  {
    id: 11,
    name: "Liam Anderson",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    time: getRandomTime(),
  },
  {
    id: 12,
    name: "Emma Thompson",
    message:
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    time: getRandomTime(),
  },
  {
    id: 13,
    name: "Noah Garcia",
    message:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    time: getRandomTime(),
  },
  {
    id: 14,
    name: "Mia Hernandez",
    message:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    time: getRandomTime(),
  },
  {
    id: 15,
    name: "James Turner",
    message:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    time: getRandomTime(),
  },
  {
    id: 16,
    name: "Grace Baker",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    time: getRandomTime(),
  },
  {
    id: 17,
    name: "Benjamin Evans",
    message:
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    time: getRandomTime(),
  },
  {
    id: 18,
    name: "Chloe Hill",
    message:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    time: getRandomTime(),
  },
  {
    id: 19,
    name: "Logan Foster",
    message:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    time: getRandomTime(),
  },
  {
    id: 20,
    name: "Avery Reed",
    message:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    time: getRandomTime(),
  },
  {
    id: 21,
    name: "Katy Perry",
    message:
      "Can we discuss how the data is being provided to the clients on an 'as is' and 'where-is' basis.",
    time: getRandomTime(),
  },
  {
    id: 22,
    name: "John Doe",
    message:
      "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.",
    time: getRandomTime(),
  },
  {
    id: 23,
    name: "dev init",
    message:
      "f you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.",
    time: getRandomTime(),
  },
];
function getRandomTime() {
  const randomHours = Math.floor(Math.random() * 5) + 1; // Range: 1 to 5 hours
  const randomMinutes = Math.floor(Math.random() * 60);
  const currentDate = new Date();
  currentDate.setHours(randomHours, randomMinutes, 0, 0); // Set random hours and minutes
  return currentDate;
}

export default DummyChat;
