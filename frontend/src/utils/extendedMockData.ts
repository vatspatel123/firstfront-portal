// Extended mock data for HR + Project Management features

export const ALL_PROJECTS_BOARD = [
  { id: 'FFS-2024-001', name: 'Shanti Niketan Roof', client: 'Acme Solar Inc', service: 'Pre-Plan Design', designer: 'Priya Sharma', capacity: '10 kW', status: 'in_design', priority: 'high', deadline: '2024-11-25' },
  { id: 'FFS-2024-002', name: 'GreenTech Office Complex', client: 'Acme Solar Inc', service: 'Detailed Design', designer: 'Unassigned', capacity: '50 kW', status: 'data_review', priority: 'medium', deadline: '2024-12-02' },
  { id: 'FFS-2024-003', name: 'Sunrise Factory Roof', client: 'Acme Solar Inc', service: 'CEIG Drawing', designer: 'Vikram Singh', capacity: '200 kW', status: 'delivered', priority: 'low', deadline: '2024-11-10' },
  { id: 'FFS-2024-004', name: 'Lake View Villa', client: 'Green Energy Ltd', service: 'Detailed Design', designer: 'Sneha Reddy', capacity: '15 kW', status: 'qa_review', priority: 'high', deadline: '2024-11-22' },
  { id: 'FFS-2024-005', name: 'Mall Roof Project', client: 'SunPower Solutions', service: 'MW-Scale Project', designer: 'Vikram Singh', capacity: '500 kW', status: 'in_design', priority: 'high', deadline: '2024-12-15' },
  { id: 'FFS-2024-006', name: 'Tech Park Solar', client: 'BuildCorp Infra', service: 'Pre-Plan Design', designer: 'Rohan Mehta', capacity: '75 kW', status: 'new', priority: 'medium', deadline: '2024-12-08' },
  { id: 'FFS-2024-007', name: 'Hospital Backup Solar', client: 'MedCare Hospitals', service: 'CEIG Drawing', designer: 'Ananya Iyer', capacity: '120 kW', status: 'data_review', priority: 'high', deadline: '2024-12-01' },
  { id: 'FFS-2024-008', name: 'Warehouse Top', client: 'LogiChain Pvt', service: 'Shadow Analysis', designer: 'Karthik Patel', capacity: '90 kW', status: 'approved', priority: 'low', deadline: '2024-11-19' },
  { id: 'FFS-2024-009', name: 'School Building Solar', client: 'EduTrust Foundation', service: 'Detailed Design', designer: 'Priya Sharma', capacity: '40 kW', status: 'in_design', priority: 'medium', deadline: '2024-12-10' },
  { id: 'FFS-2024-010', name: 'Resort Cottage Array', client: 'BeachStay Resorts', service: 'Pre-Plan Design', designer: 'Sneha Reddy', capacity: '25 kW', status: 'new', priority: 'low', deadline: '2024-12-20' },
]

export const BOARD_COLUMNS = [
  { id: 'new', label: 'New', color: 'border-gray-300', dot: 'bg-gray-400' },
  { id: 'data_review', label: 'Data Review', color: 'border-brand-300', dot: 'bg-brand-500' },
  { id: 'in_design', label: 'In Design', color: 'border-sun-400', dot: 'bg-sun-500' },
  { id: 'qa_review', label: 'QA Review', color: 'border-purple-300', dot: 'bg-purple-500' },
  { id: 'approved', label: 'Approved', color: 'border-green-300', dot: 'bg-success' },
  { id: 'delivered', label: 'Delivered', color: 'border-green-500', dot: 'bg-green-700' },
]

export const EMPLOYEES = [
  { id: 'e1', name: 'Priya Sharma', role: 'Senior Designer', department: 'Design', email: 'priya@firstfront.in', phone: '+91 98765 11111', joinDate: '2022-03-15', salary: '₹12,00,000', status: 'active', avatar: 'PS' },
  { id: 'e2', name: 'Vikram Singh', role: 'Designer', department: 'Design', email: 'vikram@firstfront.in', phone: '+91 98765 22222', joinDate: '2023-01-20', salary: '₹8,50,000', status: 'active', avatar: 'VS' },
  { id: 'e3', name: 'Ananya Iyer', role: 'Junior Designer', department: 'Design', email: 'ananya@firstfront.in', phone: '+91 98765 33333', joinDate: '2024-06-01', salary: '₹5,00,000', status: 'active', avatar: 'AI' },
  { id: 'e4', name: 'Rohan Mehta', role: 'Designer', department: 'Design', email: 'rohan@firstfront.in', phone: '+91 98765 44444', joinDate: '2023-08-10', salary: '₹8,00,000', status: 'active', avatar: 'RM' },
  { id: 'e5', name: 'Sneha Reddy', role: 'Senior Designer', department: 'Design', email: 'sneha@firstfront.in', phone: '+91 98765 55555', joinDate: '2021-11-05', salary: '₹13,50,000', status: 'active', avatar: 'SR' },
  { id: 'e6', name: 'Karthik Patel', role: 'Designer', department: 'Design', email: 'karthik@firstfront.in', phone: '+91 98765 66666', joinDate: '2024-02-15', salary: '₹7,50,000', status: 'active', avatar: 'KP' },
  { id: 'e7', name: 'Amit Verma', role: 'Operations Manager', department: 'Operations', email: 'amit@firstfront.in', phone: '+91 98765 77777', joinDate: '2020-05-01', salary: '₹18,00,000', status: 'active', avatar: 'AV' },
  { id: 'e8', name: 'Neha Kapoor', role: 'Sales Lead', department: 'Sales', email: 'neha@firstfront.in', phone: '+91 98765 88888', joinDate: '2023-04-12', salary: '₹9,00,000', status: 'active', avatar: 'NK' },
  { id: 'e9', name: 'Rahul Desai', role: 'QA Engineer', department: 'Quality', email: 'rahul@firstfront.in', phone: '+91 98765 99999', joinDate: '2022-09-20', salary: '₹10,50,000', status: 'active', avatar: 'RD' },
  { id: 'e10', name: 'Pooja Nair', role: 'Accountant', department: 'Finance', email: 'pooja@firstfront.in', phone: '+91 98765 10101', joinDate: '2023-11-08', salary: '₹7,00,000', status: 'active', avatar: 'PN' },
  { id: 'e11', name: 'Arjun Joshi', role: 'Junior Designer', department: 'Design', email: 'arjun@firstfront.in', phone: '+91 98765 20202', joinDate: '2024-09-01', salary: '₹4,50,000', status: 'probation', avatar: 'AJ' },
  { id: 'e12', name: 'Meera Saxena', role: 'HR Manager', department: 'HR', email: 'meera@firstfront.in', phone: '+91 98765 30303', joinDate: '2021-07-15', salary: '₹11,00,000', status: 'active', avatar: 'MS' },
]

export const LEAVE_REQUESTS = [
  { id: 'l1', employee: 'Priya Sharma', avatar: 'PS', type: 'Sick Leave', from: '2024-11-21', to: '2024-11-22', days: 2, reason: 'Fever and rest', status: 'pending' },
  { id: 'l2', employee: 'Vikram Singh', avatar: 'VS', type: 'Casual Leave', from: '2024-11-25', to: '2024-11-26', days: 2, reason: 'Family function', status: 'pending' },
  { id: 'l3', employee: 'Ananya Iyer', avatar: 'AI', type: 'Earned Leave', from: '2024-12-23', to: '2024-12-30', days: 8, reason: 'Year-end vacation', status: 'approved' },
  { id: 'l4', employee: 'Rohan Mehta', avatar: 'RM', type: 'Sick Leave', from: '2024-11-18', to: '2024-11-18', days: 1, reason: 'Doctor appointment', status: 'approved' },
  { id: 'l5', employee: 'Sneha Reddy', avatar: 'SR', type: 'Casual Leave', from: '2024-11-15', to: '2024-11-15', days: 1, reason: 'Personal work', status: 'rejected' },
  { id: 'l6', employee: 'Karthik Patel', avatar: 'KP', type: 'Work From Home', from: '2024-11-22', to: '2024-11-22', days: 1, reason: 'Internet installation at home', status: 'pending' },
]

export const PERFORMANCE_REVIEWS = [
  { id: 'r1', employee: 'Priya Sharma', avatar: 'PS', period: 'Q3 2024', rating: 4.8, reviewer: 'Amit Verma', status: 'completed', date: '2024-10-15', strengths: 'Technical depth, client communication', improvements: 'Could mentor juniors more actively' },
  { id: 'r2', employee: 'Vikram Singh', avatar: 'VS', period: 'Q3 2024', rating: 4.2, reviewer: 'Amit Verma', status: 'completed', date: '2024-10-12', strengths: 'Fast turnaround, CEIG expertise', improvements: 'Documentation could be more thorough' },
  { id: 'r3', employee: 'Sneha Reddy', avatar: 'SR', period: 'Q3 2024', rating: 4.9, reviewer: 'Amit Verma', status: 'completed', date: '2024-10-18', strengths: 'Exceptional design quality, leadership', improvements: 'Take on more complex projects' },
  { id: 'r4', employee: 'Ananya Iyer', avatar: 'AI', period: 'Q3 2024', rating: 3.8, reviewer: 'Priya Sharma', status: 'completed', date: '2024-10-20', strengths: 'Eagerness to learn, on-time delivery', improvements: 'Shadow analysis accuracy needs work' },
  { id: 'r5', employee: 'Rohan Mehta', avatar: 'RM', period: 'Q4 2024', rating: 0, reviewer: 'Amit Verma', status: 'pending', date: '—', strengths: '', improvements: '' },
  { id: 'r6', employee: 'Karthik Patel', avatar: 'KP', period: 'Q4 2024', rating: 0, reviewer: 'Sneha Reddy', status: 'pending', date: '—', strengths: '', improvements: '' },
]

export const EMPLOYEE_DOCUMENTS = [
  { id: 'd1', employee: 'Priya Sharma', avatar: 'PS', name: 'Offer Letter', type: 'pdf', size: '245 KB', uploaded: '2022-03-15' },
  { id: 'd2', employee: 'Priya Sharma', avatar: 'PS', name: 'Aadhaar Card', type: 'pdf', size: '180 KB', uploaded: '2022-03-15' },
  { id: 'd3', employee: 'Vikram Singh', avatar: 'VS', name: 'Employment Contract', type: 'pdf', size: '320 KB', uploaded: '2023-01-20' },
  { id: 'd4', employee: 'Sneha Reddy', avatar: 'SR', name: 'Appraisal Letter 2024', type: 'pdf', size: '190 KB', uploaded: '2024-04-01' },
  { id: 'd5', employee: 'Ananya Iyer', avatar: 'AI', name: 'NDA Agreement', type: 'pdf', size: '155 KB', uploaded: '2024-06-01' },
  { id: 'd6', employee: 'Arjun Joshi', avatar: 'AJ', name: 'Probation Letter', type: 'pdf', size: '210 KB', uploaded: '2024-09-01' },
]

export const CALENDAR_DEADLINES = [
  { id: 'c1', project: 'Sunrise Factory Roof', date: '2024-11-10', status: 'completed', designer: 'Vikram Singh' },
  { id: 'c2', project: 'Warehouse Top', date: '2024-11-19', status: 'on-track', designer: 'Karthik Patel' },
  { id: 'c3', project: 'Lake View Villa', date: '2024-11-22', status: 'on-track', designer: 'Sneha Reddy' },
  { id: 'c4', project: 'Shanti Niketan Roof', date: '2024-11-25', status: 'on-track', designer: 'Priya Sharma' },
  { id: 'c5', project: 'Hospital Backup Solar', date: '2024-12-01', status: 'at-risk', designer: 'Ananya Iyer' },
  { id: 'c6', project: 'GreenTech Office Complex', date: '2024-12-02', status: 'on-track', designer: 'Unassigned' },
  { id: 'c7', project: 'Tech Park Solar', date: '2024-12-08', status: 'on-track', designer: 'Rohan Mehta' },
  { id: 'c8', project: 'School Building Solar', date: '2024-12-10', status: 'on-track', designer: 'Priya Sharma' },
  { id: 'c9', project: 'Mall Roof Project', date: '2024-12-15', status: 'on-track', designer: 'Vikram Singh' },
  { id: 'c10', project: 'Resort Cottage Array', date: '2024-12-20', status: 'on-track', designer: 'Sneha Reddy' },
]
