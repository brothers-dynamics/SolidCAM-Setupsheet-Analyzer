export const SELECTORS = {
	'TOOL-ID': 'table:nth-of-type(5) > tbody > tr > td > table > tbody > tr:nth-of-type(1) > td:nth-of-type(3n-2) > span:nth-of-type(1)',
	'TOOL-NAME': 'table:nth-of-type(5) > tbody > tr > td > table > tbody > tr:nth-of-type(1) > td:nth-of-type(3n-2) > span:nth-of-type(6)',
	'TOOL-DIAMETER': 'table:nth-of-type(5) > tbody > tr > td > table > tbody > tr:nth-of-type(2) > td:nth-of-type(1) > span:nth-of-type(16n+2)',
	'OPERATION-TYPE': 'table:nth-of-type(7) > tbody > tr:nth-of-type(5n+1) > td:nth-of-type(2) > span:nth-of-type(2)',
	'OPERATION-TIME': 'table:nth-of-type(7) > tbody > tr:nth-of-type(5n+2) > td:last-of-type span',
	'OPERATION-TOOL-ID': 'table:nth-of-type(7) > tbody > tr:nth-of-type(5n+3) > td:first-of-type span'
}

export const FLAGS = {
	'Rough': ['R_', 'THSR', 'I3DROUGH', 'IROUGH', 'IREST'],
	'Semi-Finish': ['SEMI_'],
	'Finish': ['HSS', 'F_', 'P_', 'F3D'],
	'Drilling': ['D_', 'SPOT'],
	'Face-Milling': ['FM_']
}