export interface PortfolioPart {
	key: string;
	label: string;
	targetPct: number;
}

export interface PortfolioTemplate {
	id: string;
	label: string;
	parts: PortfolioPart[];
}

export const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
	{
		id: '50-30-20',
		label: '50/30/20',
		parts: [
			{ key: 'world', label: 'World', targetPct: 50 },
			{ key: 'emerging-markets', label: 'Emerging Markets', targetPct: 30 },
			{ key: 'europe', label: 'Europe', targetPct: 20 }
		]
	},
	{
		id: '70-30',
		label: '70/30',
		parts: [
			{ key: 'world', label: 'World', targetPct: 70 },
			{ key: 'emerging-markets', label: 'Emerging Markets', targetPct: 30 }
		]
	}
];

export function getTemplate(id: string): PortfolioTemplate | undefined {
	return PORTFOLIO_TEMPLATES.find((template) => template.id === id);
}
