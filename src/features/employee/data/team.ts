export type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  isOnline: boolean;
  taskCount: number;
  phone: string;
  telegram: string;
  /** Performance rating from 0–5 (supports half stars). */
  rating: number;
  isManager?: boolean;
};

export type TeamInfo = {
  department: string;
  memberCount: number;
  managerName: string;
  description: string;
};

export const teamInfo: TeamInfo = {
  department: "Product Design",
  memberCount: 8,
  managerName: "Sokha Chen",
  description: "Building clean task workflows for modern teams",
};

export const teamManager: TeamMember = {
  id: "mgr-1",
  name: "Sokha Chen",
  role: "Product Manager",
  avatarUrl: "https://i.pravatar.cc/120?img=12",
  isOnline: true,
  taskCount: 14,
  phone: "+85512345670",
  telegram: "sokha_chen",
  rating: 4.8,
  isManager: true,
};

export const teamMembers: TeamMember[] = [
  {
    id: "m1",
    name: "Ratana",
    role: "UI Engineer",
    avatarUrl: "https://i.pravatar.cc/80?img=1",
    isOnline: true,
    taskCount: 6,
    phone: "+85512345671",
    telegram: "ratana_ui",
    rating: 4.5,
  },
  {
    id: "m2",
    name: "Srey Leak",
    role: "Product Designer",
    avatarUrl: "https://i.pravatar.cc/80?img=5",
    isOnline: true,
    taskCount: 4,
    phone: "+85512345672",
    telegram: "srey_leak",
    rating: 4.7,
  },
  {
    id: "m3",
    name: "Piseth",
    role: "Frontend Engineer",
    avatarUrl: "https://i.pravatar.cc/80?img=8",
    isOnline: false,
    taskCount: 5,
    phone: "+85512345673",
    telegram: "piseth_dev",
    rating: 4.0,
  },
  {
    id: "m4",
    name: "Bopha",
    role: "QA Specialist",
    avatarUrl: "https://i.pravatar.cc/80?img=9",
    isOnline: true,
    taskCount: 3,
    phone: "+85512345674",
    telegram: "bopha_qa",
    rating: 4.3,
  },
  {
    id: "m5",
    name: "Vicheka",
    role: "UX Researcher",
    avatarUrl: "https://i.pravatar.cc/80?img=11",
    isOnline: false,
    taskCount: 2,
    phone: "+85512345675",
    telegram: "vicheka_ux",
    rating: 3.8,
  },
  {
    id: "m6",
    name: "Dara",
    role: "Motion Designer",
    avatarUrl: "https://i.pravatar.cc/80?img=16",
    isOnline: true,
    taskCount: 4,
    phone: "+85512345676",
    telegram: "dara_motion",
    rating: 4.2,
  },
  {
    id: "m7",
    name: "Sopheap",
    role: "Content Designer",
    avatarUrl: "https://i.pravatar.cc/80?img=20",
    isOnline: false,
    taskCount: 1,
    phone: "+85512345677",
    telegram: "sopheap_content",
    rating: 3.5,
  },
];
