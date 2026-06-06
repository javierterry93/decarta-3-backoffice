export type Product = {
	id: string;
	name: string;
	categoryId: string;
	order: number;
	price: number;
	shortDescription: string;
	visible: boolean;
	imageId: string | null;
	createdAt: string;
	updatedAt: string;
};

export type Category = {
	id: string;
	name: string;
	order: number;
	visible: boolean;
};

export type MenuImage = {
	id: string;
	name: string;
	url: string;
	thumbnailUrl: string;
	createdAt: string;
};

export type BusinessSettings = {
	name: string;
	logoUrl: string | null;
	phone: string;
	address: string;
	hours: string;
	socialInstagram: string;
	socialFacebook: string;
	socialTwitter: string;
};

export type ExcelColumnMapping = {
	excelColumn: string;
	systemField: 'name' | 'price' | 'category' | 'description' | 'skip';
};
