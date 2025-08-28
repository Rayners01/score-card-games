export interface Player {
  id: string,
  name: string,
  scores: number[]
}

export interface Colour {
  primary: string,
  hover: string
}

export const bgClasses: Colour[] = [
    { primary: "bg-pink-400", hover: "hover:bg-pink-500" },
    { primary: "bg-purple-400", hover: "hover:bg-purple-500" },
    { primary: "bg-blue-400", hover: "hover:bg-blue-500" },
    { primary: "bg-indigo-400", hover: "hover:bg-indigo-500" },
    { primary: "bg-sky-400", hover: "hover:bg-sky-500" },
    { primary: "bg-cyan-400", hover: "hover:bg-cyan-500" },
    { primary: "bg-teal-400", hover: "hover:bg-teal-500" },
    { primary: "bg-rose-400", hover: "hover:bg-rose-500" },
    { primary: "bg-fuchsia-400", hover: "hover:bg-fuchsia-500" },
    { primary: "bg-violet-400", hover: "hover:bg-violet-500" },
    { primary: "bg-orange-400", hover: "hover:bg-orange-500" },
    { primary: "bg-lime-400", hover: "hover:bg-lime-500" }
];