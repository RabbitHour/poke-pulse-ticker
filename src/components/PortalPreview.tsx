import {Link} from 'react-router-dom';
import CollectionReports from './CollectionReports';
export default function PortalPreview(){return <div id="portal-preview" className="space-y-3"><section className="terminal-card p-5 space-y-3"><h2 className="font-bold">Your free collector account</h2><p className="text-sm">Create an account without payment details. Use free market lookup and explore optional collection reports when they launch.</p><Link to="/account" className="market-action inline-block">Create free account</Link></section><CollectionReports /></div>;}
