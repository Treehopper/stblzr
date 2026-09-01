export interface PortfolioPart {
	key: string;
	label: string;
	targetPct: number;
}

export interface PortfolioTemplate {
	id: string;
	label: string;
	description: string;
	parts: PortfolioPart[];
}

export const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
	{
		id: '50-30-20',
		label: '50/30/20',
		description:
			'Weights regions roughly by their share of global economic output (GDP): World, Emerging Markets, and Europe.',
		parts: [
			{ key: 'world', label: 'World', targetPct: 50 },
			{ key: 'emerging-markets', label: 'Emerging Markets', targetPct: 30 },
			{ key: 'europe', label: 'Europe', targetPct: 20 }
		]
	},
	{
		id: '70-30',
		label: '70/30',
		description:
			'A simpler split favoring World over Emerging Markets, without a separate Europe allocation.',
		parts: [
			{ key: 'world', label: 'World', targetPct: 70 },
			{ key: 'emerging-markets', label: 'Emerging Markets', targetPct: 30 }
		]
	}
];

export function getTemplate(id: string): PortfolioTemplate | undefined {
	return PORTFOLIO_TEMPLATES.find((template) => template.id === id);
}
