import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  ChevronDown,
  CircleHelp,
  Clock3,
  Cpu,
  Database,
  FileText,
  Gauge,
  HardDrive,
  LifeBuoy,
  LockKeyhole,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ViewKey = "overview" | "cpu" | "alerts" | "maintenance";
type SeverityFilter = "ทั้งหมด" | "สูง" | "กลาง" | "ต่ำ";

const navItems: { id: ViewKey; label: string; icon: typeof Gauge; count?: string }[] = [
  { id: "overview", label: "Command Center", icon: Gauge },
  { id: "cpu", label: "CPU", icon: Cpu },
  { id: "alerts", label: "Alerts", icon: Bell, count: "03" },
  { id: "maintenance", label: "Maintenance queue", icon: Wrench, count: "02" },
];

const cpuSeries = [
  { time: "09:00", value: 31, host: "node-a" },
  { time: "09:10", value: 35, host: "node-a" },
  { time: "09:20", value: 34, host: "node-a" },
  { time: "09:30", value: 42, host: "node-a" },
  { time: "09:40", value: 38, host: "node-a" },
  { time: "09:50", value: 49, host: "node-a" },
  { time: "10:00", value: 45, host: "node-a" },
  { time: "10:10", value: 52, host: "node-a" },
  { time: "10:20", value: 47, host: "node-a" },
  { time: "10:30", value: 43, host: "node-a" },
  { time: "10:40", value: 39, host: "node-a" },
  { time: "10:50", value: 44, host: "node-a" },
];

const alertRows = [
  {
    id: "ALT-DEMO-014",
    severity: "สูง",
    title: "CPU utilization สูงกว่าช่วงตัวอย่าง",
    host: "node-a · region-bkk-1",
    source: "DEMO rule cpu-sample-v2",
    sourceTime: "UNKNOWN · ไม่มี Source Timestamp",
    received: "ตัวอย่าง 10:42 ICT",
    evidence: "EV-DEMO-088 · cpu-window-15m",
  },
  {
    id: "ALT-DEMO-011",
    severity: "กลาง",
    title: "พื้นที่จัดเก็บเหลือน้อยในชุดตัวอย่าง",
    host: "storage-02 · region-bkk-1",
    source: "DEMO rule disk-capacity-v1",
    sourceTime: "UNKNOWN · ไม่มี Source Timestamp",
    received: "ตัวอย่าง 10:18 ICT",
    evidence: "EV-DEMO-081 · disk-sample",
  },
  {
    id: "ALT-DEMO-009",
    severity: "ต่ำ",
    title: "ความหน่วงเครือข่ายแกว่งในชุดตัวอย่าง",
    host: "edge-gw-03 · region-sgp-1",
    source: "DEMO rule latency-sample-v1",
    sourceTime: "UNKNOWN · ไม่มี Source Timestamp",
    received: "ตัวอย่าง 09:56 ICT",
    evidence: "EV-DEMO-076 · latency-window",
  },
];

const maintenanceRows = [
  {
    id: "MNT-DEMO-028",
    title: "ตรวจสอบพื้นที่จัดเก็บ · storage-02",
    kind: "Capacity review",
    risk: "สูง",
    approval: "รอผู้ทบทวน",
    window: "ยังไม่กำหนด",
    evidence: "EV-DEMO-081",
    postcheck: "PC-DEMO-028 · ยังไม่มีผล",
    rollback: "บันทึกแนวทางย้อนกลับก่อนจัดตาราง",
  },
  {
    id: "MNT-DEMO-024",
    title: "ทบทวน CPU sample · node-a",
    kind: "Observability review",
    risk: "ต่ำ",
    approval: "รอหลักฐาน",
    window: "ไม่มีช่วงปฏิบัติงาน",
    evidence: "EV-DEMO-088",
    postcheck: "PC-DEMO-024 · ยังไม่เริ่ม",
    rollback: "ไม่ใช่งานเปลี่ยนระบบ",
  },
];

const seriesByRange: Record<string, typeof cpuSeries> = {
  "1 ชม.": cpuSeries,
  "6 ชม.": [
    { time: "05:00", value: 28, host: "node-a" },
    { time: "05:30", value: 33, host: "node-a" },
    { time: "06:00", value: 30, host: "node-a" },
    { time: "06:30", value: 37, host: "node-a" },
    { time: "07:00", value: 41, host: "node-a" },
    { time: "07:30", value: 36, host: "node-a" },
    { time: "08:00", value: 45, host: "node-a" },
    { time: "08:30", value: 40, host: "node-a" },
    { time: "09:00", value: 31, host: "node-a" },
    { time: "09:30", value: 42, host: "node-a" },
    { time: "10:00", value: 45, host: "node-a" },
    { time: "10:30", value: 43, host: "node-a" },
  ],
  "24 ชม.": [
    { time: "00:00", value: 22, host: "node-a" },
    { time: "02:00", value: 26, host: "node-a" },
    { time: "04:00", value: 24, host: "node-a" },
    { time: "06:00", value: 30, host: "node-a" },
    { time: "08:00", value: 45, host: "node-a" },
    { time: "10:00", value: 45, host: "node-a" },
    { time: "12:00", value: 41, host: "node-a" },
    { time: "14:00", value: 48, host: "node-a" },
    { time: "16:00", value: 40, host: "node-a" },
    { time: "18:00", value: 37, host: "node-a" },
    { time: "20:00", value: 43, host: "node-a" },
    { time: "22:00", value: 35, host: "node-a" },
  ],
};

function DemoTag({ children = "DEMO" }: { children?: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[#c68b56]/30 bg-[#f7eee4] px-2 py-0.5 text-[10px] font-bold tracking-[0.13em] text-[#8b5631]">
      {children}
    </span>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#77817f]">
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[#788884]">
          {eyebrow}
        </p>
        <h2 className="font-[var(--ops-display)] text-[21px] font-semibold tracking-[-0.035em] text-[#172c31]">
          {title}
        </h2>
        {detail && <p className="mt-1 text-xs text-[#71807d]">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

function FreshnessCard() {
  return (
    <div className="rounded-xl border border-[#d7dfda] bg-[#f7f8f4] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock3 size={15} className="text-[#697b77]" />
          <Label>Source freshness</Label>
        </div>
        <span className="rounded-full border border-[#d8c9ae] bg-[#f6f1e7] px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] text-[#796544]">
          UNKNOWN
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold text-[#243b3e]">ไม่มี Source Timestamp</p>
      <p className="mt-1 text-xs leading-relaxed text-[#73817e]">
        ต้นแบบนี้ไม่มีข้อมูลเวลาจากแหล่งต้นทาง จึงประเมินความสดใหม่ไม่ได้
      </p>
    </div>
  );
}

function MetricTile({
  label,
  value,
  note,
  icon: Icon,
  trend,
  accent = "teal",
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Cpu;
  trend?: "up" | "down";
  accent?: "teal" | "amber" | "rust";
}) {
  const iconColor =
    accent === "amber" ? "text-[#a67c41]" : accent === "rust" ? "text-[#ad6850]" : "text-[#3b7772]";
  return (
    <div className="relative min-w-0 rounded-xl border border-[#dce2dc] bg-[#fbfcf8] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Label>{label}</Label>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-[var(--ops-display)] text-[27px] font-semibold tracking-[-0.05em] text-[#183238]">
              {value}
            </span>
            {trend && (
              <span className="inline-flex items-center text-[11px] text-[#7b8580]">
                {trend === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                DEMO
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[#798480]">{note}</p>
        </div>
        <span className={`rounded-lg bg-[#edf2ee] p-2 ${iconColor}`}>
          <Icon size={17} />
        </span>
      </div>
    </div>
  );
}

function DemoChart({
  data,
  compact = false,
}: {
  data: typeof cpuSeries;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "relative h-[190px] min-w-0 w-full overflow-hidden" : "relative h-[260px] min-w-0 w-full overflow-hidden"}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 18, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#39847d" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#39847d" stopOpacity={0.015} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5eae4" vertical={false} strokeDasharray="2 5" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#87918d", fontSize: 10 }}
            interval="preserveStartEnd"
            dy={8}
          />
          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: "#87918d", fontSize: 10 }}
            tickFormatter={(value: number) => `${value}%`}
          />
          <Tooltip
            cursor={{ stroke: "#87a39c", strokeDasharray: "3 4" }}
            contentStyle={{
              border: "1px solid #dce4dd",
              borderRadius: 10,
              background: "#fbfcf8",
              fontSize: 11,
              boxShadow: "0 8px 22px rgba(31,55,54,.08)",
            }}
            formatter={(value: number) => [`${value}% · DEMO`, "CPU"]}
            labelStyle={{ color: "#64736f", marginBottom: 4 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3e8079"
            strokeWidth={2.2}
            fill="url(#cpuFill)"
            activeDot={{ r: 4, fill: "#3e8079", stroke: "#f7faf6", strokeWidth: 2 }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SeverityPill({ severity }: { severity: string }) {
  const styles =
    severity === "สูง"
      ? "bg-[#f5e8e1] text-[#a45f49] border-[#e8cfc3]"
      : severity === "กลาง"
        ? "bg-[#f5f0e3] text-[#92713e] border-[#e5dbc2]"
        : "bg-[#eaf1ed] text-[#567e6c] border-[#d3e1d8]";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${styles}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {severity}
    </span>
  );
}

function StatusChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[#d8dfd9] bg-[#f6f8f4] px-2 py-1 text-[10px] font-semibold text-[#62716d]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#a79263]" />
      {children}
    </span>
  );
}

function PreviewButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      disabled
      title="ต้นแบบเท่านั้น · ไม่มีการดำเนินการจริง"
      className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[#dce2dc] bg-[#f4f6f2] px-3 py-2 text-[11px] font-semibold text-[#86918b] opacity-80"
    >
      <LockKeyhole size={12} />
      {children}
    </button>
  );
}

function OverviewContent({
  setActiveView,
  data,
  range,
  setRange,
}: {
  setActiveView: (view: ViewKey) => void;
  data: typeof cpuSeries;
  range: string;
  setRange: (range: string) => void;
}) {
  return (
    <>
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.55fr_.85fr]">
        <section className="overflow-hidden rounded-2xl border border-[#d8e0d9] bg-[#fbfcf8]">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e4e9e3] px-5 py-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Activity size={15} className="text-[#3d817b]" />
                <Label>Telemetry condition · illustrative only</Label>
              </div>
              <h2 className="font-[var(--ops-display)] text-[20px] font-semibold tracking-[-0.04em] text-[#183238]">
                ภาพรวมการสังเกตการณ์
              </h2>
              <p className="mt-1 text-xs text-[#77827f]">
                ตัวอย่าง CPU ที่สร้างขึ้นเพื่อแสดงรูปแบบหน้าจอเท่านั้น
              </p>
            </div>
            <DemoTag>DEMO SAMPLE</DemoTag>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
            <div className="flex items-center gap-2 text-xs text-[#64736f]">
              <span className="h-2 w-2 rounded-full bg-[#57918a]" />
              CPU · node-a
              <span className="ml-1 rounded bg-[#eef3ef] px-2 py-1 text-[10px] text-[#6d7d77]">0–100%</span>
            </div>
            <div className="flex items-center rounded-lg border border-[#e0e5df] bg-[#f4f6f2] p-0.5">
              {Object.keys(seriesByRange).map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setRange(item)}
                  className={`rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
                    range === item ? "bg-[#fbfcf8] text-[#315d59] shadow-sm" : "text-[#84908b] hover:text-[#385e5a]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="px-4 pb-1 pt-2">
            <DemoChart data={data} compact />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e7ebe6] px-5 py-3 text-[10px] text-[#7a8580]">
            <span>ทุกจุดข้อมูลเป็น DEMO · ไม่มีการเชื่อมต่อ node</span>
            <span className="font-medium text-[#8c7450]">CPU thresholds: NOT CONFIGURED</span>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <FreshnessCard />
          <div className="rounded-xl border border-[#d7dfda] bg-[#f7f8f4] p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#5e8174]" />
              <Label>Alert / incident state</Label>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#243b3e]">ไม่มี incident จริงที่โหลด</p>
              <span className="rounded-full border border-[#d9d3c7] bg-[#f2efe8] px-2.5 py-1 text-[9px] font-bold tracking-[0.08em] text-[#776e5b]">NOT ASSESSED</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#73817e]">
              ตัวอย่าง Alert ด้านล่างไม่ใช่สัญญาณสุขภาพหรือสถานะจริงของระบบ
            </p>
            <button
              type="button"
              onClick={() => setActiveView("alerts")}
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#3c716c] hover:text-[#245b56]"
            >
              ดู Alert ตัวอย่าง <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="CPU · DEMO" value="44%" note="ค่าตัวอย่างล่าสุด · node-a" icon={Cpu} trend="up" />
        <MetricTile label="CPU sample peak" value="52%" note="สูงสุดในชุดตัวอย่างนี้" icon={Activity} trend="up" accent="amber" />
        <MetricTile label="Alerts · DEMO" value="03" note="เหตุการณ์สมมติ ไม่ใช่ incident จริง" icon={AlertTriangle} accent="rust" />
        <MetricTile label="Maintenance queue" value="02" note="ระเบียนตัวอย่าง · ยังไม่มีการอนุมัติ" icon={Wrench} accent="amber" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-[#dce2dc] bg-[#fbfcf8] p-5">
          <SectionHeading
            eyebrow="Signals · DEMO"
            title="ตัวอย่างที่ต้องทบทวน"
            detail="ข้อมูลจำลองสำหรับตรวจการจัดลำดับ ไม่ใช่การแจ้งเตือนจากระบบ"
            action={
              <button type="button" onClick={() => setActiveView("alerts")} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#3d746d]">
                เปิด Alerts <ArrowRight size={13} />
              </button>
            }
          />
          <div className="space-y-2">
            {alertRows.slice(0, 2).map((row) => (
              <div key={row.id} className="flex flex-col gap-3 rounded-xl border border-[#e3e8e2] bg-[#f8faf6] p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 rounded-lg bg-[#f2ede3] p-2 text-[#9b7943]"><AlertTriangle size={15} /></span>
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <SeverityPill severity={row.severity} />
                      <span className="font-mono text-[10px] text-[#83908a]">{row.id}</span>
                    </div>
                    <p className="text-[12px] font-semibold text-[#2d4142]">{row.title}</p>
                    <p className="mt-1 text-[10px] text-[#7d8984]">{row.host}</p>
                  </div>
                </div>
                <DemoTag />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#dce2dc] bg-[#fbfcf8] p-5">
          <SectionHeading
            eyebrow="Governance · DEMO"
            title="Maintenance queue"
            detail="การทบทวนและอนุมัติเป็นคนละสถานะกับ Alert"
            action={
              <button type="button" onClick={() => setActiveView("maintenance")} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#3d746d]">
                เปิดคิว <ArrowRight size={13} />
              </button>
            }
          />
          <div className="space-y-2">
            {maintenanceRows.map((item) => (
              <div key={item.id} className="rounded-xl border border-[#e3e8e2] bg-[#f8faf6] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-[#84908b]">{item.id}</span>
                  <StatusChip>{item.approval}</StatusChip>
                </div>
                <p className="mt-2 text-[12px] font-semibold text-[#2d4142]">{item.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-[#7c8883]">
                  <span>Risk {item.risk}</span><span className="h-1 w-1 rounded-full bg-[#bdc7bf]" />
                  <span>{item.evidence}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function CpuView({
  data,
  range,
  setRange,
}: {
  data: typeof cpuSeries;
  range: string;
  setRange: (range: string) => void;
}) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2"><Cpu size={15} className="text-[#3b7b75]" /><Label>CPU observability</Label><DemoTag /></div>
          <h2 className="font-[var(--ops-display)] text-[25px] font-semibold tracking-[-0.045em] text-[#183238]">CPU · ภาพตัวอย่าง</h2>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[#75817d]">ข้อมูลทุกจุดเป็น DEMO เท่านั้น ไม่มีการเชื่อมต่อ host จริง และไม่ใช้ประกอบการตัดสินใจด้าน capacity</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#e0e5df] bg-[#f4f6f2] p-1">
          {Object.keys(seriesByRange).map((item) => (
            <button key={item} type="button" onClick={() => setRange(item)} className={`rounded-md px-3 py-2 text-[11px] font-medium ${range === item ? "bg-[#fbfcf8] text-[#315d59] shadow-sm" : "text-[#84908b]"}`}>{item}</button>
          ))}
        </div>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Current sample · DEMO" value="44%" note="ตัวอย่าง ณ จุดท้ายกราฟ" icon={Cpu} />
        <MetricTile label="Sample average" value="41.6%" note="ค่าเฉลี่ยจากชุดข้อมูลจำลอง" icon={Activity} />
        <MetricTile label="Sample peak" value="52%" note="จุดสูงสุดในช่วงที่เลือก" icon={ArrowUpRight} accent="amber" />
        <MetricTile label="Threshold policy" value="—" note="CPU thresholds ยังไม่ได้ตั้งค่า" icon={SlidersHorizontal} accent="rust" />
      </div>
      <section className="mb-5 rounded-2xl border border-[#dce2dc] bg-[#fbfcf8]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e6ebe5] px-5 py-4">
          <div><Label>Host · node-a / region-bkk-1</Label><h3 className="mt-1 text-sm font-semibold text-[#263e40]">CPU utilization · %</h3></div>
          <div className="flex flex-wrap gap-2"><DemoTag /><StatusChip>Source freshness UNKNOWN</StatusChip></div>
        </div>
        <div className="px-4 pb-2 pt-4"><DemoChart data={data} /></div>
        <div className="grid gap-0 border-t border-[#e6ebe5] sm:grid-cols-3">
          <div className="border-b border-[#e6ebe5] px-5 py-3 sm:border-b-0 sm:border-r"><Label>Source Timestamp</Label><p className="mt-1 text-xs font-medium text-[#687874]">UNKNOWN · ไม่มี timestamp</p></div>
          <div className="border-b border-[#e6ebe5] px-5 py-3 sm:border-b-0 sm:border-r"><Label>Received Timestamp</Label><p className="mt-1 text-xs font-medium text-[#687874]">DEMO · แสดงผลตัวอย่าง</p></div>
          <div className="px-5 py-3"><Label>Thresholds</Label><p className="mt-1 text-xs font-semibold text-[#9a7144]">NOT CONFIGURED</p></div>
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#dce2dc] bg-[#f8faf6] p-4">
          <div className="flex items-center gap-2"><CircleHelp size={15} className="text-[#748681]" /><Label>วิธีอ่านข้อมูล</Label></div>
          <p className="mt-2 text-xs leading-relaxed text-[#6f7d78]">เส้นกราฟเป็นชุดตัวเลขจำลองเพื่อทดสอบการแสดงผลเท่านั้น ค่าที่เห็นไม่แทนภาวะการทำงานของ MeeChain หรือ node ใด ๆ</p>
        </div>
        <div className="rounded-xl border border-[#ded8c9] bg-[#f6f2e9] p-4">
          <div className="flex items-center gap-2"><AlertTriangle size={15} className="text-[#9b7943]" /><Label>Configuration boundary</Label></div>
          <p className="mt-2 text-xs leading-relaxed text-[#786d59]">ไม่มีเกณฑ์ CPU ที่กำหนดไว้ UI นี้จึงไม่ตีความค่าเป็น healthy / unhealthy และไม่สร้าง Alert จากตัวอย่าง</p>
        </div>
      </div>
    </>
  );
}

function AlertsView({
  filter,
  setFilter,
}: {
  filter: SeverityFilter;
  setFilter: (filter: SeverityFilter) => void;
}) {
  const filtered = useMemo(
    () => (filter === "ทั้งหมด" ? alertRows : alertRows.filter((row) => row.severity === filter)),
    [filter],
  );
  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2"><Bell size={15} className="text-[#aa7951]" /><Label>Alert register</Label><DemoTag /></div>
          <h2 className="font-[var(--ops-display)] text-[25px] font-semibold tracking-[-0.045em] text-[#183238]">Alert · ตัวอย่างสำหรับ triage</h2>
          <p className="mt-1.5 text-xs text-[#75817d]">ทุกเหตุการณ์เป็นข้อมูลสมมติ ไม่ได้มาจากระบบ monitoring จริง</p>
        </div>
        <StatusChip>สถานะระบบจริง: NOT ASSESSED</StatusChip>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dce2dc] bg-[#f8faf6] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-semibold text-[#677671]">Severity</span>
          {(["ทั้งหมด", "สูง", "กลาง", "ต่ำ"] as SeverityFilter[]).map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${filter === item ? "border-[#8ba9a0] bg-[#e8f0eb] text-[#35645d]" : "border-[#dfe5df] bg-[#fbfcf8] text-[#77847e]"}`}>{item}</button>
          ))}
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] text-[#798680]"><Search size={12} /> แสดงข้อมูลตัวอย่าง {filtered.length} รายการ</span>
      </div>
      <div className="space-y-3">
        {filtered.map((row) => (
          <article key={row.id} className="overflow-hidden rounded-xl border border-[#dce2dc] bg-[#fbfcf8]">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e7ebe6] px-4 py-4 md:px-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 rounded-lg bg-[#f3eee5] p-2.5 text-[#a77c48]"><AlertTriangle size={16} /></span>
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2"><SeverityPill severity={row.severity} /><DemoTag /><span className="font-mono text-[10px] text-[#83908a]">{row.id}</span></div>
                  <h3 className="text-[13px] font-semibold text-[#2c4142]">{row.title}</h3>
                  <p className="mt-1 text-[11px] text-[#77847f]">{row.host}</p>
                </div>
              </div>
              <StatusChip>State · ตัวอย่างใหม่</StatusChip>
            </div>
            <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-b border-[#edf0eb] px-4 py-3 sm:border-r lg:border-b-0"><Label>Source Timestamp</Label><p className="mt-1.5 text-[11px] font-medium text-[#596c68]">{row.sourceTime}</p></div>
              <div className="border-b border-[#edf0eb] px-4 py-3 lg:border-b-0 lg:border-r"><Label>Received Timestamp</Label><p className="mt-1.5 text-[11px] font-medium text-[#596c68]">{row.received}</p></div>
              <div className="border-b border-[#edf0eb] px-4 py-3 sm:border-r lg:border-b-0"><Label>Rule / source</Label><p className="mt-1.5 text-[11px] font-medium text-[#596c68]">{row.source}</p></div>
              <div className="px-4 py-3"><Label>Evidence reference</Label><p className="mt-1.5 font-mono text-[11px] font-medium text-[#50756e]">{row.evidence}</p></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e7ebe6] bg-[#f7f9f5] px-4 py-3 md:px-5">
              <p className="text-[10px] text-[#788580]">การส่งต่อทำได้เฉพาะระเบียน incident / maintenance หลังมีการทบทวน</p>
              <PreviewButton>Preview only · ไม่มีการส่งต่อจริง</PreviewButton>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function MaintenanceView() {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2"><Wrench size={15} className="text-[#827653]" /><Label>Maintenance governance</Label><DemoTag /></div>
          <h2 className="font-[var(--ops-display)] text-[25px] font-semibold tracking-[-0.045em] text-[#183238]">Maintenance queue</h2>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[#75817d]">คิวตัวอย่างสำหรับแยก risk, evidence และสถานะอนุมัติ ไม่มีการอนุมัติหรือดำเนินงานจริง</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg border border-[#ded8c9] bg-[#f6f2e9] px-3 py-2 text-[10px] font-bold tracking-[0.08em] text-[#786d59]"><LockKeyhole size={13} /> ACTIONS DISABLED</span>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <MetricTile label="Review queue · DEMO" value="02" note="ระเบียนสมมติที่แสดงในคิว" icon={FileText} />
        <MetricTile label="Approval state" value="0" note="ไม่มีการอนุมัติจริง" icon={ShieldCheck} accent="amber" />
        <MetricTile label="Execution state" value="OFF" note="ไม่มีการเชื่อมต่อระบบปฏิบัติงาน" icon={LockKeyhole} accent="rust" />
      </div>
      <div className="space-y-4">
        {maintenanceRows.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-[#dce2dc] bg-[#fbfcf8]">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5eae4] px-4 py-4 md:px-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="rounded-xl bg-[#f0f1e9] p-2.5 text-[#777957]"><HardDrive size={17} /></span>
                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] text-[#84908b]">{item.id}</span><DemoTag /></div>
                  <h3 className="text-[14px] font-semibold text-[#2b4141]">{item.title}</h3>
                  <p className="mt-1 text-[11px] text-[#798680]">{item.kind} · ระเบียนตัวอย่างเท่านั้น</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${item.risk === "สูง" ? "border-[#e8cfc3] bg-[#f5e8e1] text-[#a45f49]" : "border-[#d3e1d8] bg-[#eaf1ed] text-[#567e6c]"}`}>Risk · {item.risk}</span>
                <StatusChip>{item.approval}</StatusChip>
              </div>
            </div>
            <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-4">
              <div className="border-b border-[#edf0eb] px-4 py-3 md:border-r xl:border-b-0"><Label>Review / approval gate</Label><p className="mt-1.5 text-[11px] font-medium text-[#5e706b]">{item.approval} · ยังไม่มีผู้ทบทวนที่ระบุ</p></div>
              <div className="border-b border-[#edf0eb] px-4 py-3 xl:border-b-0 xl:border-r"><Label>Scheduled window</Label><p className="mt-1.5 text-[11px] font-medium text-[#5e706b]">{item.window}</p></div>
              <div className="border-b border-[#edf0eb] px-4 py-3 md:border-r xl:border-b-0"><Label>Evidence reference</Label><p className="mt-1.5 font-mono text-[11px] font-medium text-[#50756e]">{item.evidence}</p></div>
              <div className="px-4 py-3"><Label>Post-check reference</Label><p className="mt-1.5 font-mono text-[11px] font-medium text-[#687772]">{item.postcheck}</p></div>
            </div>
            <div className="grid gap-3 border-t border-[#e7ebe6] bg-[#f7f9f5] px-4 py-4 md:grid-cols-[1fr_auto] md:items-center md:px-5">
              <div>
                <Label>Rollback note</Label>
                <p className="mt-1 text-[11px] text-[#6e7b76]">{item.rollback}</p>
                <p className="mt-2 text-[10px] leading-relaxed text-[#8a8170]">Operator boundary: ไม่มี restart, deploy, configuration edit, validator operation หรือธุรกรรมทางการเงินผ่านหน้านี้</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <PreviewButton>ทบทวน · Preview only</PreviewButton>
                <PreviewButton>อนุมัติ · Disabled</PreviewButton>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-[#ded8c9] bg-[#f6f2e9] p-4">
        <div className="flex items-start gap-3">
          <LifeBuoy size={16} className="mt-0.5 shrink-0 text-[#8b7956]" />
          <div><p className="text-xs font-semibold text-[#6e6149]">Governance boundary</p><p className="mt-1 text-[11px] leading-relaxed text-[#81755d]">Alert อาจเชื่อมโยงไปยัง incident หรือ maintenance record เพื่อการทบทวนเท่านั้น หน้านี้ไม่มี backend, external API หรือ live node และไม่มีการสั่ง restart, deploy, แก้ config, validator operation, transfer, payout หรือเปลี่ยน balance</p></div>
        </div>
      </div>
    </>
  );
}

export function CommandCenter() {
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [range, setRange] = useState("1 ชม.");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("ทั้งหมด");
  const chartData = seriesByRange[range];
  const pageTitle = navItems.find((item) => item.id === activeView)?.label ?? "Command Center";

  return (
    <div
      className="min-h-[100dvh] bg-[#eef2ed] text-[#213739]"
      style={{
        fontFamily: '"IBM Plex Sans Thai", "Noto Sans Thai", sans-serif',
        ["--ops-display" as string]: '"Manrope", "IBM Plex Sans Thai", sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
        .ops-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .ops-scroll::-webkit-scrollbar-thumb { background: #cbd5ce; border-radius: 8px; }
      `}</style>
      <div className="sticky top-0 z-30 border-b border-[#d5ddd6] bg-[#f8faf6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#244b4b] text-[#dcece3]">
              <Activity size={18} strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-[var(--ops-display)] text-[13px] font-extrabold tracking-[-0.03em] text-[#1d393d]">MeeChain <span className="font-medium text-[#72817b]">/ Ops Desk</span></p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#84918b]">Internal operations workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#e3d3c4] bg-[#f8efe6] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#b57850]" />
            <span className="text-[10px] font-extrabold tracking-[0.12em] text-[#89583a]">DEMO / NO LIVE CONNECTION</span>
          </div>
          <div className="hidden items-center gap-2 text-[10px] font-medium text-[#77857f] md:flex">
            <span className="rounded-md border border-[#dce3dc] bg-[#f1f5f0] px-2 py-1">ระบบปฏิบัติการ · Prototype</span>
            <div className="grid h-8 w-8 place-items-center rounded-full border border-[#d5dfd8] bg-[#e9f0e9] text-[10px] font-bold text-[#526b63]">ME</div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-3 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#e3cdb8] bg-[#f8eee4] px-4 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#a96e49]" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-[#825238]">DEMO ONLY — ไม่มีข้อมูลจากระบบจริง</p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-[#8c705b]">ตัวเลขและเหตุการณ์ทั้งหมดเป็นข้อมูลประกอบต้นแบบ · Source freshness: UNKNOWN · ไม่มี backend, external API หรือ live node · ห้ามใช้เป็นหลักฐานสถานะระบบ</p>
          </div>
          <span className="hidden rounded-md border border-[#dfc3a8] bg-[#fbf5ee] px-2 py-1 text-[9px] font-bold tracking-[0.11em] text-[#9a6844] sm:inline-flex">ILLUSTRATIVE DATA</span>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[218px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-2xl border border-[#d9e0da] bg-[#f8faf6] p-3 lg:sticky lg:top-[84px]">
            <div className="mb-3 px-2 pt-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#89948e]">Operations</p>
              <p className="mt-1 font-[var(--ops-display)] text-[13px] font-semibold text-[#2c4443]">System maintenance</p>
            </div>
            <nav className="grid grid-cols-2 gap-1.5 lg:flex lg:flex-col" aria-label="Local dashboard views">
              {navItems.map((item) => {
                const Icon = item.icon;
                const selected = activeView === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    aria-current={selected ? "page" : undefined}
                    className={`group flex w-full min-w-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[11px] font-semibold transition-colors ${
                      selected ? "bg-[#e6efea] text-[#315f59]" : "text-[#71807a] hover:bg-[#f0f4ef] hover:text-[#375d57]"
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.9} />
                    <span className="min-w-0 truncate">{item.label}</span>
                    {item.count && <span className={`ml-auto rounded px-1.5 py-0.5 font-mono text-[9px] ${selected ? "bg-[#d7e6de] text-[#427168]" : "bg-[#edf1ec] text-[#84908a]"}`}>{item.count}</span>}
                  </button>
                );
              })}
            </nav>
            <div className="mt-4 hidden border-t border-[#e4e9e3] px-2 pt-3 lg:block">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8c9891]">Status separation</p>
              <ul className="mt-2 space-y-2 text-[10px] text-[#6f7c76]">
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#57918a]" />Telemetry · DEMO</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#a79263]" />Freshness · UNKNOWN</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#b57850]" />Incident · NOT ASSESSED</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#8a8a68]" />Approval · separate gate</li>
              </ul>
            </div>
            <div className="mt-4 hidden rounded-lg bg-[#f0f3ef] p-3 lg:block">
              <div className="flex items-center gap-2 text-[#698079]"><Database size={13} /><span className="text-[9px] font-bold uppercase tracking-[0.12em]">Data source</span></div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-[#7e8b84]">Static illustrative records. No external connection.</p>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2 text-[10px] text-[#82908a]">
                  <span>Ops Desk</span><span>/</span><span className="text-[#52726b]">{pageTitle}</span>
                </div>
                <h1 className="font-[var(--ops-display)] text-[27px] font-semibold tracking-[-0.05em] text-[#183238] sm:text-[31px]">{pageTitle}</h1>
                <p className="mt-1 text-[11px] text-[#76837e]">ศูนย์ปฏิบัติการระบบ · ตัวอย่างหน้าจอแบบไม่เชื่อมต่อ</p>
              </div>
              <div className="flex max-w-full min-w-0 items-center gap-2 rounded-lg border border-[#dce3dc] bg-[#f8faf6] px-3 py-2 text-[10px] text-[#74817b]">
                <Clock3 size={13} className="shrink-0" /><span className="min-w-0 truncate">เวลารับข้อมูล: ไม่มีข้อมูลสด</span><ChevronDown size={12} className="shrink-0" />
              </div>
            </div>

            {activeView === "overview" && <OverviewContent setActiveView={setActiveView} data={chartData} range={range} setRange={setRange} />}
            {activeView === "cpu" && <CpuView data={chartData} range={range} setRange={setRange} />}
            {activeView === "alerts" && <AlertsView filter={severityFilter} setFilter={setSeverityFilter} />}
            {activeView === "maintenance" && <MaintenanceView />}

            <footer className="mt-8 flex flex-col gap-2 border-t border-[#dce3dc] pt-4 text-[9px] leading-relaxed text-[#8a9590] sm:flex-row sm:items-center sm:justify-between">
              <span>MECHAIN OPS DESK · PROTOTYPE · NO LIVE CONNECTION</span>
              <span>Alerts may route to records for review only · No operational or financial actions</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default CommandCenter;
