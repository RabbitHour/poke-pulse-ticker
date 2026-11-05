import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
export default class RenderBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  componentDidCatch(error: Error) { console.error('Page rendering failed', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main id="main-content" className="min-h-screen bg-background text-foreground p-8"><h1 className="text-2xl">Poké Pulse Engine</h1><p className="my-4">This page could not load. Your saved data has not been changed.</p><Button onClick={() => window.location.reload()}>Retry page</Button></main>;
  }
}