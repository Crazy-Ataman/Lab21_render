import { Router, Request, Response } from 'express';
import * as fs from 'fs/promises';
import { Contact } from '../models/contact.js';

export class ContactHandler {
	public router: Router;

	constructor() {
		this.router = Router();
		this.router.get('/', this.getIndex.bind(this));
		this.router.get('/add', this.getAdd.bind(this));
		this.router.post('/add', this.postAdd.bind(this));
		this.router.get('/update', this.getUpdate.bind(this));
		this.router.post('/update', this.postUpdate.bind(this));
		this.router.post('/delete', this.postDelete.bind(this));
	}

	private async getIndex(req: Request, res: Response) {
		const contacts = await this.readContacts();
		res.render('home', { contacts });
	}

	private async getAdd(req: Request, res: Response) {
		const contacts = await this.readContacts();
		res.render('add', { contacts, deny: true });
	}

	private async postAdd(req: Request, res: Response) {
		const string = req.body.contact;
		const regex = /^(\S+\s+\S+)\s+(\d+)$/;
		const [name, phone] = string.match(regex).slice(1);
		if (!RegExp(/^[\d]*$/).test(phone)) {
			res.status(400).send('Invalid phone number');
			return;
		}

		const contacts: Contact[] = await this.readContacts();
		contacts.push(new Contact(name, phone));
		await this.writeContacts(contacts);

		res.render('home', { contacts });
	}

	private async getUpdate(req: Request, res: Response) {
		const contacts = await this.readContacts();
		res.render('update', { contacts, name: req.query.name, telephone: req.query.telephone, deny: true });
	}

	private async postUpdate(req: Request, res: Response) {
		const { newContact, oldContact } = req.body;
		const regex = /^(\S+\s+\S+)\s+(\d+)$/;
		const [oldName, oldPhone] = oldContact.match(regex).slice(1);
		const [newName, newPhone] = newContact.match(regex).slice(1);

		const contacts: Contact[] = await this.readContacts();
		const index = contacts.findIndex(c => c.name === oldName && c.telephone === oldPhone);

		contacts[index] = new Contact(newName, newPhone);
		await this.writeContacts(contacts);

		res.render('home', { contacts });
	}

	private async postDelete(req: Request, res: Response) {
		const string = req.body.contact;
		const regex = /^(\S+\s+\S+)\s+(\d+)$/;
		const [name, phone] = string.match(regex).slice(1);

		const contacts: Contact[] = await this.readContacts();
		const index = contacts.findIndex(c => c.name === name && c.telephone === phone);

		contacts.splice(index, 1);
		await this.writeContacts(contacts);

		res.render('home', { contacts });
	}

	private async readContacts(): Promise<Contact[]> {
		const file = await fs.readFile('./contacts.json', 'utf-8');
		return JSON.parse(file);
	}

	private async writeContacts(contacts: Contact[]) {
		await fs.writeFile('./contacts.json', JSON.stringify(contacts));
	}
}