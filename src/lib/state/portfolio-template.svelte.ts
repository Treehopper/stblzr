let selectedTemplateId = $state<string | null>(null);

export const templateSelection = {
	get id() {
		return selectedTemplateId;
	},
	select(id: string) {
		selectedTemplateId = id;
	}
};
