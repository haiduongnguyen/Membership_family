export type MockPerson = {
  id: string;
  name: string;
  role: string;
  age: number;
  generation: number;
};

export type MockLink = {
  id: string;
  source: string;
  target: string;
  relation: "blood" | "marriage" | "social" | "work";
  label: string;
};

export type MockTimelineEvent = {
  id: string;
  title: string;
  date: string;
  description: string;
};

export type MockCommunityGraph = {
  people: MockPerson[];
  links: MockLink[];
  timeline: MockTimelineEvent[];
};

const FAMILY_GRAPH: MockCommunityGraph = {
  people: [
    { id: "p1", name: "Ông Nam", role: "Ông nội", age: 78, generation: 3 },
    { id: "p2", name: "Bà Hòa", role: "Bà nội", age: 74, generation: 3 },
    { id: "p3", name: "Bố An", role: "Bố", age: 50, generation: 2 },
    { id: "p4", name: "Mẹ Hương", role: "Mẹ", age: 47, generation: 2 },
    { id: "p5", name: "Tôi", role: "Bản thân", age: 27, generation: 1 },
    { id: "p6", name: "Em Linh", role: "Em gái", age: 21, generation: 1 },
    { id: "p7", name: "Bé Su", role: "Con", age: 3, generation: 0 },
  ],
  links: [
    { id: "l1", source: "p1", target: "p3", relation: "blood", label: "Cha - con" },
    { id: "l2", source: "p2", target: "p3", relation: "blood", label: "Mẹ - con" },
    { id: "l3", source: "p3", target: "p4", relation: "marriage", label: "Vợ chồng" },
    { id: "l4", source: "p3", target: "p5", relation: "blood", label: "Cha - con" },
    { id: "l5", source: "p4", target: "p5", relation: "blood", label: "Mẹ - con" },
    { id: "l6", source: "p3", target: "p6", relation: "blood", label: "Cha - con" },
    { id: "l7", source: "p4", target: "p6", relation: "blood", label: "Mẹ - con" },
    { id: "l8", source: "p5", target: "p7", relation: "blood", label: "Cha - con" },
  ],
  timeline: [
    { id: "e1", title: "Sinh nhật Bố", date: "2026-05-15", description: "Tổ chức bữa cơm gia đình" },
    { id: "e2", title: "Họp mặt gia đình", date: "2026-06-01", description: "Gặp mặt cuối tuần" },
    { id: "e3", title: "Kỷ niệm ngày cưới", date: "2026-08-21", description: "Bố mẹ kỷ niệm 30 năm" },
  ],
};

const COMPANY_GRAPH: MockCommunityGraph = {
  people: [
    { id: "c1", name: "Anh Minh", role: "Head of Product", age: 38, generation: 3 },
    { id: "c2", name: "Chị Lan", role: "Product Manager", age: 31, generation: 2 },
    { id: "c3", name: "Tôi", role: "Product Designer", age: 27, generation: 1 },
    { id: "c4", name: "Tuấn", role: "Frontend Dev", age: 26, generation: 1 },
    { id: "c5", name: "Hà", role: "Data Analyst", age: 28, generation: 1 },
  ],
  links: [
    { id: "cl1", source: "c1", target: "c2", relation: "work", label: "Quản lý" },
    { id: "cl2", source: "c2", target: "c3", relation: "work", label: "Quản lý" },
    { id: "cl3", source: "c2", target: "c4", relation: "work", label: "Quản lý" },
    { id: "cl4", source: "c2", target: "c5", relation: "work", label: "Quản lý" },
    { id: "cl5", source: "c3", target: "c4", relation: "social", label: "Đồng nghiệp" },
  ],
  timeline: [
    { id: "ce1", title: "Sprint Planning", date: "2026-05-12", description: "Lên kế hoạch sprint mới" },
    { id: "ce2", title: "Release v2.4", date: "2026-05-30", description: "Phát hành bản mới" },
  ],
};

const FRIEND_GRAPH: MockCommunityGraph = {
  people: [
    { id: "f1", name: "Tôi", role: "Bạn thân", age: 27, generation: 1 },
    { id: "f2", name: "Khánh", role: "Bạn đại học", age: 27, generation: 1 },
    { id: "f3", name: "My", role: "Bạn đại học", age: 26, generation: 1 },
    { id: "f4", name: "Duy", role: "Bạn cấp 3", age: 27, generation: 1 },
  ],
  links: [
    { id: "fl1", source: "f1", target: "f2", relation: "social", label: "Bạn thân" },
    { id: "fl2", source: "f1", target: "f3", relation: "social", label: "Bạn" },
    { id: "fl3", source: "f1", target: "f4", relation: "social", label: "Bạn" },
  ],
  timeline: [
    { id: "fe1", title: "Họp lớp", date: "2026-07-10", description: "Gặp lại bạn cũ" },
    { id: "fe2", title: "Du lịch Đà Lạt", date: "2026-09-02", description: "Chuyến đi 3 ngày" },
  ],
};

export function getMockCommunityGraph(type: string): MockCommunityGraph {
  if (type === "company") return COMPANY_GRAPH;
  if (type === "friends") return FRIEND_GRAPH;
  return FAMILY_GRAPH;
}
