export type ChecklistTemplateItem = {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
};

export type PlanPhaseKpi = {
  id: string;
  name: string;
  target: number;
  unit: string;
  description: string;
  direction: 'increase' | 'decrease';
  mockHistory: number[];
};

export type PlanPhase = {
  id: string;
  name: string;
  summary: string;
  objectives: string[];
  timeline: {
    start: string;
    end: string;
    keyMilestones: string[];
  };
  capitalAllocation: {
    total: string;
    breakdown: string[];
  };
  kpis: PlanPhaseKpi[];
  risks: string[];
  killCriteria: string[];
  checklist: ChecklistTemplateItem[];
};

export type RiskTemplate = {
  id: string;
  title: string;
  owner: string;
  mitigation: string;
  status: 'Open' | 'Monitoring' | 'Mitigated';
  notes: string;
};

export type ExitChecklistItem = {
  id: string;
  title: string;
  description: string;
};

export type Plan = {
  id: string;
  name: string;
  description: string;
  sponsor: string;
  timeline: string;
  strategicTheme: string;
  totalBudget: string;
  primaryObjective: string;
  highlightTags: string[];
  phases: PlanPhase[];
  baselineRisks: RiskTemplate[];
  exitChecklist: ExitChecklistItem[];
};

export const plans: Plan[] = [
  {
    id: 'northwind-expansion',
    name: 'Northwind Expansion 2025',
    description:
      'Scale the Northwind logistics platform into two new geographies while improving gross margin and customer NPS.',
    sponsor: 'Aria Chen, COO',
    timeline: 'Jan 2024 – Dec 2025',
    strategicTheme: 'Market expansion & operational leverage',
    totalBudget: '$4.8M',
    primaryObjective: 'Launch profitable expansion playbook in two high-growth regions.',
    highlightTags: ['Logistics', 'Growth', 'Customer Experience'],
    phases: [
      {
        id: 'market-validation',
        name: 'Market validation',
        summary: 'Validate demand, pricing, and regulatory requirements for the two target regions.',
        objectives: [
          'Conduct deep customer discovery in the DACH and ASEAN markets.',
          'Secure regulatory approvals and partner due diligence before pilot.',
          'Establish baseline unit economics that achieve 20% margin after month six.',
        ],
        timeline: {
          start: '2024-01-15',
          end: '2024-04-30',
          keyMilestones: [
            'Complete 30 enterprise interviews',
            'File regulatory documents',
            'Pilot pricing & incentives validated',
          ],
        },
        capitalAllocation: {
          total: '$1.2M',
          breakdown: [
            'Customer research pods and travel',
            'Regulatory and legal advisory retainers',
            'Market launch readiness tooling',
          ],
        },
        kpis: [
          {
            id: 'northwind-market-validation-leads',
            name: 'Qualified enterprise leads per month',
            target: 35,
            unit: 'leads/mo',
            description: 'Number of ICP-qualified enterprise leads sourced in each new market.',
            direction: 'increase',
            mockHistory: [12, 18, 24, 28],
          },
          {
            id: 'northwind-market-validation-nps',
            name: 'Pilot NPS',
            target: 45,
            unit: 'NPS',
            description: 'Net promoter score from pilot customers across the two regions.',
            direction: 'increase',
            mockHistory: [20, 26, 32, 36],
          },
        ],
        risks: [
          'Regulatory approval could slip beyond Q2 without senior relationship support.',
          'Customer willingness to switch from incumbents may require higher incentives.',
        ],
        killCriteria: [
          'Pilot conversion rate below 20% after 90 days of activation.',
          'Customer acquisition cost exceeding $6K without path to reduction.',
        ],
        checklist: [
          {
            id: 'market-validation-task-1',
            title: 'Schedule regional regulatory review board session',
            owner: 'Expansion PMO',
            dueDate: '2024-02-16',
          },
          {
            id: 'market-validation-task-2',
            title: 'Complete 30 enterprise discovery interviews',
            owner: 'Research Guild',
            dueDate: '2024-03-08',
          },
          {
            id: 'market-validation-task-3',
            title: 'Validate pricing envelope with finance',
            owner: 'Finance partner',
            dueDate: '2024-03-28',
          },
          {
            id: 'market-validation-task-4',
            title: 'Publish go/no-go recommendation',
            owner: 'COO office',
            dueDate: '2024-04-26',
          },
        ],
      },
      {
        id: 'pilot-rollout',
        name: 'Pilot rollout',
        summary: 'Launch pilot operations with lighthouse customers and iterate on service quality loops.',
        objectives: [
          'Activate at least five lighthouse customers in each region.',
          'Achieve delivery SLAs within ±5 minutes of target promise.',
          'Hit $1.4M ARR run-rate by end of pilot period.',
        ],
        timeline: {
          start: '2024-05-06',
          end: '2024-09-30',
          keyMilestones: ['First customer shipment in each region', 'Operational dashboard live', 'ARR run-rate > $1M'],
        },
        capitalAllocation: {
          total: '$2.1M',
          breakdown: ['Regional operations squads', 'Customer success pods', 'Telemetry & routing upgrades'],
        },
        kpis: [
          {
            id: 'northwind-pilot-rollout-arr',
            name: 'ARR run-rate',
            target: 1.4,
            unit: '$M ARR',
            description: 'Annual recurring revenue run-rate achieved by pilot customers.',
            direction: 'increase',
            mockHistory: [0.3, 0.55, 0.9, 1.1],
          },
          {
            id: 'northwind-pilot-rollout-sla',
            name: 'Delivery SLA adherence',
            target: 95,
            unit: '% on-time',
            description: 'Percentage of deliveries meeting the promised SLA window.',
            direction: 'increase',
            mockHistory: [82, 86, 90, 92],
          },
        ],
        risks: [
          'Telemetry integrations may lag causing SLA degradations.',
          'Pilot customers could require bespoke workflows that strain ops capacity.',
        ],
        killCriteria: [
          'ARR run-rate below $750K after four months.',
          'Delivery SLA adherence below 85% for two consecutive months.',
        ],
        checklist: [
          {
            id: 'pilot-rollout-task-1',
            title: 'Finalize pilot customer legal agreements',
            owner: 'Legal partner',
            dueDate: '2024-05-15',
          },
          {
            id: 'pilot-rollout-task-2',
            title: 'Stand up telemetry dashboard',
            owner: 'Data platform lead',
            dueDate: '2024-06-10',
          },
          {
            id: 'pilot-rollout-task-3',
            title: 'Complete first-region hypercare checklist',
            owner: 'Regional GM',
            dueDate: '2024-07-05',
          },
          {
            id: 'pilot-rollout-task-4',
            title: 'Run midpoint pilot health review',
            owner: 'COO office',
            dueDate: '2024-08-19',
          },
        ],
      },
      {
        id: 'scale-optimize',
        name: 'Scale & optimize',
        summary: 'Formalize expansion playbook, scale operations, and optimize profitability levers.',
        objectives: [
          'Achieve 28% gross margin while maintaining SLA commitments.',
          'Deploy automated routing and partner onboarding workflows.',
          'Transition to steady-state operating model with regional leadership fully in place.',
        ],
        timeline: {
          start: '2024-10-07',
          end: '2025-12-12',
          keyMilestones: ['Regional GM hiring complete', 'Automation milestone 1', 'Playbook retros drafted'],
        },
        capitalAllocation: {
          total: '$1.5M',
          breakdown: ['Automation initiatives', 'Leadership hiring', 'Training & enablement'],
        },
        kpis: [
          {
            id: 'northwind-scale-margin',
            name: 'Gross margin',
            target: 28,
            unit: '%',
            description: 'Gross margin for new regions after steady-state month three.',
            direction: 'increase',
            mockHistory: [18, 19, 22, 24],
          },
          {
            id: 'northwind-scale-churn',
            name: 'Customer logo churn',
            target: 4,
            unit: '%',
            description: 'Percentage of pilot customers churning within six months.',
            direction: 'decrease',
            mockHistory: [9, 8, 7, 6],
          },
        ],
        risks: [
          'Automation roadmap may slip without dedicated engineering capacity.',
          'Regional leadership hiring could lag the operating needs.',
        ],
        killCriteria: [
          'Gross margin below 15% for three consecutive months.',
          'Logo churn above 10% after scale phase kickoff.',
        ],
        checklist: [
          {
            id: 'scale-optimize-task-1',
            title: 'Finalize automation architecture blueprint',
            owner: 'CTO office',
            dueDate: '2024-11-04',
          },
          {
            id: 'scale-optimize-task-2',
            title: 'Hire and onboard regional GMs',
            owner: 'People team',
            dueDate: '2025-02-10',
          },
          {
            id: 'scale-optimize-task-3',
            title: 'Publish steady-state operating playbook',
            owner: 'Expansion PMO',
            dueDate: '2025-05-19',
          },
          {
            id: 'scale-optimize-task-4',
            title: 'Run exit readiness review',
            owner: 'COO office',
            dueDate: '2025-10-24',
          },
        ],
      },
    ],
    baselineRisks: [
      {
        id: 'northwind-risk-1',
        title: 'Regulatory approval slippage',
        owner: 'COO office',
        mitigation: 'Escalate through advisory council and secure government relations support.',
        status: 'Open',
        notes: '',
      },
      {
        id: 'northwind-risk-2',
        title: 'Pilot incentive overrun',
        owner: 'Finance partner',
        mitigation: 'Model incentive burn weekly and introduce guardrails by cohort.',
        status: 'Monitoring',
        notes: '',
      },
      {
        id: 'northwind-risk-3',
        title: 'Ops tooling adoption lag',
        owner: 'Expansion PMO',
        mitigation: 'Embed enablement leads in-region for first 60 days.',
        status: 'Monitoring',
        notes: '',
      },
    ],
    exitChecklist: [
      {
        id: 'northwind-exit-1',
        title: 'Runway confirmed',
        description: '12-month operating runway funded and board approved for new regions.',
      },
      {
        id: 'northwind-exit-2',
        title: 'Playbook institutionalized',
        description: 'Expansion playbook documented with metrics and ownership.',
      },
      {
        id: 'northwind-exit-3',
        title: 'Leadership fully staffed',
        description: 'Regional leadership roles filled and performing to scorecard.',
      },
      {
        id: 'northwind-exit-4',
        title: 'Automation milestone achieved',
        description: 'Automation roadmap v1 deployed with telemetry in place.',
      },
    ],
  },
  {
    id: 'atlas-modernization',
    name: 'Atlas Platform Modernization',
    description:
      'Re-platform Atlas billing and entitlements service to unlock developer velocity and reduce incident risk.',
    sponsor: 'Diego Patel, CTO',
    timeline: 'Sep 2023 – Aug 2024',
    strategicTheme: 'Platform resilience & speed',
    totalBudget: '$3.2M',
    primaryObjective: 'Deliver a cloud-native billing core with 99.95% uptime and 2x faster feature velocity.',
    highlightTags: ['Platform', 'Reliability', 'Developer Experience'],
    phases: [
      {
        id: 'architecture-alignment',
        name: 'Architecture alignment',
        summary: 'Define target architecture, decompose monolith, and secure compliance approval.',
        objectives: [
          'Produce target state architecture RFIs signed off by security.',
          'Retire 60% of legacy billing dependencies in favor of services.',
          'Align engineering squads on migration runway and SLAs.',
        ],
        timeline: {
          start: '2023-09-04',
          end: '2023-12-15',
          keyMilestones: ['Architecture review complete', 'Data model ratified', 'Migration sequencing locked'],
        },
        capitalAllocation: {
          total: '$0.8M',
          breakdown: ['Architecture guild capacity', 'Security & compliance reviews', 'Data migration tooling'],
        },
        kpis: [
          {
            id: 'atlas-architecture-leadtime',
            name: 'Lead time for change',
            target: 3,
            unit: 'days',
            description: 'Average lead time for platform deployments post-architecture alignment.',
            direction: 'decrease',
            mockHistory: [9, 8, 6, 5],
          },
          {
            id: 'atlas-architecture-incident',
            name: 'Billing incidents (sev1/sev2)',
            target: 0,
            unit: 'per quarter',
            description: 'Number of critical billing incidents triggered during architecture work.',
            direction: 'decrease',
            mockHistory: [4, 3, 2, 1],
          },
        ],
        risks: ['Scope creep from adjacent modernization asks.', 'Compliance review cycles may add delay.'],
        killCriteria: [
          'Architecture sign-off misses Q4 without mitigation path.',
          'Critical incidents increase due to partial migrations.',
        ],
        checklist: [
          {
            id: 'architecture-task-1',
            title: 'Complete service decomposition workshop',
            owner: 'Platform architect',
            dueDate: '2023-10-02',
          },
          {
            id: 'architecture-task-2',
            title: 'Map data lineage and retention requirements',
            owner: 'Data lead',
            dueDate: '2023-10-30',
          },
          {
            id: 'architecture-task-3',
            title: 'Security & compliance review sign-off',
            owner: 'Security steward',
            dueDate: '2023-11-20',
          },
          {
            id: 'architecture-task-4',
            title: 'Executive go/no-go checkpoint',
            owner: 'CTO office',
            dueDate: '2023-12-12',
          },
        ],
      },
      {
        id: 'service-migration',
        name: 'Service migration',
        summary: 'Incrementally migrate billing functions to the new service mesh with feature parity.',
        objectives: [
          'Deliver feature-complete billing API v2.',
          'Minimize customer impact with dual-write strategy and canary releases.',
          'Retire 80% of legacy VM footprint by launch.',
        ],
        timeline: {
          start: '2024-01-08',
          end: '2024-06-21',
          keyMilestones: ['Dual-write path live', 'Entitlements parity achieved', 'Legacy API deprecation notice'],
        },
        capitalAllocation: {
          total: '$1.9M',
          breakdown: ['Core migration squads', 'QA automation', 'Customer comms & enablement'],
        },
        kpis: [
          {
            id: 'atlas-migration-error-rate',
            name: 'Migration error rate',
            target: 0.2,
            unit: '% of transactions',
            description: 'Percentage of billing transactions requiring manual intervention.',
            direction: 'decrease',
            mockHistory: [1.2, 0.9, 0.6, 0.4],
          },
          {
            id: 'atlas-migration-feature-gap',
            name: 'Feature gap backlog',
            target: 0,
            unit: 'items',
            description: 'Count of parity gaps between legacy and modernized services.',
            direction: 'decrease',
            mockHistory: [28, 18, 10, 6],
          },
        ],
        risks: [
          'Dual-write may introduce reconciliation defects if monitoring is lagging.',
          'Customer enablement backlog could delay general availability.',
        ],
        killCriteria: [
          'Error rate above 1% for more than two releases.',
          'Feature parity backlog fails to trend down for six weeks.',
        ],
        checklist: [
          {
            id: 'service-migration-task-1',
            title: 'Launch migration control tower dashboard',
            owner: 'Platform PM',
            dueDate: '2024-02-02',
          },
          {
            id: 'service-migration-task-2',
            title: 'Enable safe rollback automation',
            owner: 'DevOps lead',
            dueDate: '2024-03-15',
          },
          {
            id: 'service-migration-task-3',
            title: 'Publish customer migration guide',
            owner: 'Product marketing',
            dueDate: '2024-04-05',
          },
          {
            id: 'service-migration-task-4',
            title: 'Entitlements GA readiness review',
            owner: 'Product manager',
            dueDate: '2024-05-24',
          },
        ],
      },
      {
        id: 'stabilization',
        name: 'Stabilization & acceleration',
        summary: 'Stabilize the platform post-migration and accelerate roadmap delivery velocity.',
        objectives: [
          'Achieve 99.95% uptime measured over rolling 90 days.',
          'Reduce lead time for change to under three days.',
          'Double developer release throughput without incident regressions.',
        ],
        timeline: {
          start: '2024-06-24',
          end: '2024-08-30',
          keyMilestones: ['Reliability SLOs met', 'Legacy infrastructure decomissioned', 'Velocity metrics trending up'],
        },
        capitalAllocation: {
          total: '$0.5M',
          breakdown: ['SRE burn-down squad', 'Instrumentation upgrades', 'Developer enablement lab'],
        },
        kpis: [
          {
            id: 'atlas-stabilization-uptime',
            name: 'Uptime',
            target: 99.95,
            unit: '%',
            description: 'Measured platform uptime over 90 days post cutover.',
            direction: 'increase',
            mockHistory: [99.3, 99.5, 99.6, 99.7],
          },
          {
            id: 'atlas-stabilization-deploy-frequency',
            name: 'Deploy frequency',
            target: 28,
            unit: 'deploys/week',
            description: 'Weekly deploys of the billing service after modernization.',
            direction: 'increase',
            mockHistory: [10, 14, 18, 22],
          },
        ],
        risks: [
          'Burn-out risk from extended migration sprints.',
          'Legacy decommission tasks could leak back onto migration squads.',
        ],
        killCriteria: [
          'SLOs not met within eight weeks of GA.',
          'Developer throughput regresses below pre-modernization baseline.',
        ],
        checklist: [
          {
            id: 'stabilization-task-1',
            title: 'Complete reliability game-day exercises',
            owner: 'SRE lead',
            dueDate: '2024-07-18',
          },
          {
            id: 'stabilization-task-2',
            title: 'Decommission final legacy VMs',
            owner: 'Infra team',
            dueDate: '2024-08-02',
          },
          {
            id: 'stabilization-task-3',
            title: 'Publish developer velocity report',
            owner: 'DX analyst',
            dueDate: '2024-08-16',
          },
          {
            id: 'stabilization-task-4',
            title: 'Executive exit review',
            owner: 'CTO office',
            dueDate: '2024-08-28',
          },
        ],
      },
    ],
    baselineRisks: [
      {
        id: 'atlas-risk-1',
        title: 'Hidden dependencies in legacy code',
        owner: 'Platform architect',
        mitigation: 'Add deep-dive spike to map and test unknown cross-service calls.',
        status: 'Open',
        notes: '',
      },
      {
        id: 'atlas-risk-2',
        title: 'Compliance review backlog',
        owner: 'Security steward',
        mitigation: 'Pre-schedule checkpoints with compliance and keep readiness artifacts current.',
        status: 'Monitoring',
        notes: '',
      },
      {
        id: 'atlas-risk-3',
        title: 'Team fatigue during migration',
        owner: 'Eng leadership',
        mitigation: 'Institute mandatory cooldown sprints and rotate on-call coverage.',
        status: 'Monitoring',
        notes: '',
      },
    ],
    exitChecklist: [
      {
        id: 'atlas-exit-1',
        title: 'Legacy system decommissioned',
        description: 'Legacy billing stack fully retired with no transactional drift.',
      },
      {
        id: 'atlas-exit-2',
        title: 'Reliability SLOs achieved',
        description: '99.95% uptime and <0.2% error rate sustained over 90 days.',
      },
      {
        id: 'atlas-exit-3',
        title: 'Runbook automation complete',
        description: 'Critical runbooks automated with peer-reviewed coverage.',
      },
      {
        id: 'atlas-exit-4',
        title: 'Developer velocity uplift',
        description: 'Deploy frequency doubled compared to pre-modernization baseline.',
      },
    ],
  },
];
