export const MOCK_USER = {
  id: 'u1',
  name: 'Rajesh Patel',
  company: 'Acme Solar Inc',
  email: 'rajesh@acmesolar.com',
  role: 'client' as const,
  avatar: 'RP',
}

export const MOCK_DESIGNER = {
  id: 'd1',
  name: 'Priya Sharma',
  role: 'designer' as const,
  avatar: 'PS',
  todayTasks: 4,
}

export const MOCK_ADMIN = {
  id: 'a1',
  name: 'Amit Verma',
  role: 'admin' as const,
  avatar: 'AV',
}

export const SERVICE_TYPES = [
  { id: 'pre-plan', name: 'Pre-Plan Design', desc: 'Quick 3D layout & shadow analysis', icon: 'Sun' },
  { id: 'detailed', name: 'Detailed Design & Consultancy', desc: 'Complete engineering with Pvyst simulations', icon: 'FileSearch' },
  { id: 'mw-scale', name: 'MW-Scale Project', desc: 'Utility-scale ground mount & substation design', icon: 'Building2' },
  { id: 'ceig', name: 'CEIG Drawing', desc: 'Compliant electrical drawings for approvals', icon: 'FileText' },
  { id: 'shadow', name: 'Shadow Analysis & Certificate', desc: 'Detailed shadow report with structure certificate', icon: 'Search' },
]

export const PROJECT_STATUS_FLOW = [
  { id: 'new', label: 'New', color: 'bg-gray-100 text-gray-600' },
  { id: 'data_review', label: 'Data Review', color: 'bg-brand-50 text-brand-600' },
  { id: 'in_design', label: 'In Design', color: 'bg-sun-100 text-sun-700' },
  { id: 'qa_review', label: 'QA Review', color: 'bg-purple-50 text-purple-600' },
  { id: 'approved', label: 'Approved', color: 'bg-success-bg text-success' },
  { id: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
]

export const MOCK_PROJECTS = [
  {
    id: 'FFS-2024-001',
    name: 'Shanti Niketan Roof',
    client: 'Acme Solar Inc',
    service: 'Pre-Plan Design',
    location: 'Mumbai, Maharashtra',
    capacity: '10 kW',
    type: 'Residential',
    status: 'in_design',
    stage: 2,
    totalStages: 6,
    designer: 'Priya Sharma',
    progress: 45,
    createdAt: '2024-11-15',
    updatedAt: '2024-11-20',
    files: [
      { name: 'site-photo-1.jpg', size: '2.4 MB', date: '2024-11-15', type: 'image' },
      { name: 'site-photo-2.jpg', size: '1.8 MB', date: '2024-11-15', type: 'image' },
      { name: 'kml-location.kml', size: '12 KB', date: '2024-11-15', type: 'kml' },
    ],
    outputs: [
      { name: 'shadow-analysis-report.pdf', size: '4.2 MB', date: '2024-11-18' },
      { name: '3D-layout-preview.png', size: '3.1 MB', date: '2024-11-18' },
    ],
    timeline: [
      { status: 'New', date: '2024-11-15', note: 'Project created by client' },
      { status: 'Data Review', date: '2024-11-16', note: 'Site data received, review started' },
      { status: 'In Design', date: '2024-11-18', note: 'Shadow analysis in progress', active: true },
    ],
  },
  {
    id: 'FFS-2024-002',
    name: 'GreenTech Office Complex',
    client: 'Acme Solar Inc',
    service: 'Detailed Design & Consultancy',
    location: 'Pune, Maharashtra',
    capacity: '50 kW',
    type: 'Commercial',
    status: 'data_review',
    stage: 1,
    totalStages: 6,
    designer: 'Unassigned',
    progress: 20,
    createdAt: '2024-11-18',
    updatedAt: '2024-11-19',
    files: [
      { name: 'site-plan.pdf', size: '5.2 MB', date: '2024-11-18', type: 'pdf' },
    ],
    outputs: [],
    timeline: [
      { status: 'New', date: '2024-11-18', note: 'Project created' },
      { status: 'Data Review', date: '2024-11-19', note: 'Awaiting additional site photos', active: true },
    ],
  },
  {
    id: 'FFS-2024-003',
    name: 'Sunrise Factory Roof',
    client: 'Acme Solar Inc',
    service: 'CEIG Drawing',
    location: 'Nagpur, Maharashtra',
    capacity: '200 kW',
    type: 'Industrial',
    status: 'delivered',
    stage: 5,
    totalStages: 6,
    designer: 'Vikram Singh',
    progress: 100,
    createdAt: '2024-10-20',
    updatedAt: '2024-11-10',
    files: [
      { name: 'electrical-single-line.pdf', size: '3.8 MB', date: '2024-10-22', type: 'pdf' },
    ],
    outputs: [
      { name: 'ceig-drawing-final.pdf', size: '6.1 MB', date: '2024-11-10' },
      { name: 'approval-certificate.pdf', size: '1.2 MB', date: '2024-11-10' },
    ],
    timeline: [
      { status: 'New', date: '2024-10-20' },
      { status: 'Data Review', date: '2024-10-22' },
      { status: 'In Design', date: '2024-10-25' },
      { status: 'QA Review', date: '2024-11-05' },
      { status: 'Approved', date: '2024-11-08' },
      { status: 'Delivered', date: '2024-11-10', active: true },
    ],
  },
]

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'success', icon: 'Sun', message: 'Your shadow analysis for Shanti Niketan Roof is ready!', time: '2 hours ago', read: false },
  { id: 'n2', type: 'info', icon: 'FileText', message: 'New output uploaded for Project FFS-2024-001', time: '5 hours ago', read: false },
  { id: 'n3', type: 'warning', icon: 'Camera', message: 'We need more site photos for GreenTech Office', time: '1 day ago', read: true },
  { id: 'n4', type: 'success', icon: 'CheckCircle', message: 'CEIG drawing approved for Sunrise Factory', time: '3 days ago', read: true },
]

export const MOCK_DESIGNER_TASKS = [
  { id: 't1', project: 'Shanti Niketan Roof', client: 'Acme Solar Inc', task: 'Complete shadow analysis report', priority: 'high', deadline: 'Today' },
  { id: 't2', project: 'GreenTech Office', client: 'Acme Solar Inc', task: 'Review uploaded site data', priority: 'medium', deadline: 'Tomorrow' },
  { id: 't3', project: 'Lake View Villa', client: 'Green Energy Ltd', task: 'Generate 3D layout', priority: 'high', deadline: 'Today' },
  { id: 't4', project: 'Mall Roof Project', client: 'SunPower Solutions', task: 'Run Pvyst simulation', priority: 'low', deadline: 'This week' },
]

export const MOCK_MGMT_STATS = {
  projectsThisMonth: 24,
  projectsGrowth: 12,
  pendingApprovals: 8,
  revenue: '₹12,50,000',
  alerts: [
    { project: 'Mall Roof Project', issue: 'CEIG drawing pending approval — Maharashtra DISCOM', priority: 'high' },
    { project: 'GreenTech Office', issue: 'Awaiting client site photos — 5 days overdue', priority: 'medium' },
    { project: 'Lake View Villa', issue: 'Shadow report review needed', priority: 'low' },
  ],
}
