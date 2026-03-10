export interface InterrogationItem {
  text: string;
  timestampFrom: string;
  timestampTo: string;
  youtubeLink: string;
}

export interface EvidenceData {
  evidence: string;
  evidenceViolation: string;
  evidenceServers: string;
  identityPerson: string;
}

export interface ReportData {
  reportNumber: number;
  agentId: string;
  organizationName: string;
  items: InterrogationItem[];
  evidenceData: EvidenceData;
  date: string;
}
