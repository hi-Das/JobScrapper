'use client';

import { useState, useEffect } from 'react';
import { Site, Job } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { Plus, RefreshCw, ExternalLink, Trash2, Eye, EyeOff } from 'lucide-react';

export default function Home() {
  const [sites, setSites] = useState<Site[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showAddSite, setShowAddSite] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  // Form state for adding site
  const [newSite, setNewSite] = useState({
    name: '',
    url: '',
    selector: '',
  });

  useEffect(() => {
    fetchData();
  }, [showNewOnly]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sitesRes, jobsRes] = await Promise.all([
        fetch('/api/sites'),
        fetch(`/api/jobs${showNewOnly ? '?onlyNew=true' : ''}`),
      ]);

      const sitesData = await sitesRes.json();
      const jobsData = await jobsRes.json();

      setSites(sitesData.sites || []);
      setJobs(jobsData.jobs || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSite),
      });

      if (res.ok) {
        setNewSite({ name: '', url: '', selector: '' });
        setShowAddSite(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error adding site:', error);
    }
  };

  const handleEditSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;
    
    try {
      const res = await fetch(`/api/sites?id=${editingSite.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingSite.name,
          url: editingSite.url,
          selector: editingSite.selector,
        }),
      });

      if (res.ok) {
        setEditingSite(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating site:', error);
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!confirm('Delete this site?')) return;
    try {
      await fetch(`/api/sites?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting site:', error);
    }
  };

  const handleScrape = async (siteId?: string) => {
    setScraping(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteId ? { siteId } : {}),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error scraping:', error);
    } finally {
      setScraping(false);
    }
  };

  const handleMarkAsSeen = async (jobId: string) => {
    try {
      await fetch(`/api/jobs?id=${jobId}`, { method: 'PATCH' });
      fetchData();
    } catch (error) {
      console.error('Error marking job as seen:', error);
    }
  };

  const newJobsCount = jobs.filter((j) => j.is_new).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Compact Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
              <p className="text-sm text-gray-500 mt-1">
                {sites.length} sites • {jobs.length} jobs • 
                <span className="text-green-600 font-medium ml-1">{newJobsCount} new</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddSite(!showAddSite)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Site
              </button>
              <button
                onClick={() => handleScrape()}
                disabled={scraping}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
                {scraping ? 'Scraping...' : 'Scrape All'}
              </button>
              <button
                onClick={() => setShowNewOnly(!showNewOnly)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-md transition-colors ${
                  showNewOnly 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showNewOnly ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showNewOnly ? 'All Jobs' : 'New Only'}
              </button>
            </div>
          </div>
        </div>

        {/* Compact Add/Edit Site Form */}
        {(showAddSite || editingSite) && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              {editingSite ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                  Edit Site
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add New Site
                </>
              )}
            </h2>
            <form onSubmit={editingSite ? handleEditSite : handleAddSite} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Site Name</label>
                <input
                  type="text"
                  required
                  value={editingSite ? editingSite.name : newSite.name}
                  onChange={(e) => 
                    editingSite 
                      ? setEditingSite({ ...editingSite, name: e.target.value })
                      : setNewSite({ ...newSite, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Google Careers"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Career Page URL</label>
                <input
                  type="url"
                  required
                  value={editingSite ? editingSite.url : newSite.url}
                  onChange={(e) => 
                    editingSite 
                      ? setEditingSite({ ...editingSite, url: e.target.value })
                      : setNewSite({ ...newSite, url: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://careers.example.com/jobs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  CSS Selector <span className="text-gray-400">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingSite ? editingSite.selector : newSite.selector}
                  onChange={(e) => 
                    editingSite 
                      ? setEditingSite({ ...editingSite, selector: e.target.value })
                      : setNewSite({ ...newSite, selector: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder=".job-listing, div.job-item"
                />
              </div>
              <div className="md:col-span-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSite(false);
                    setEditingSite(null);
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingSite ? 'Update Site' : 'Add Site'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Compact Sites Table */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tracked Sites</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {sites.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-sm">No sites yet. Click "Add Site" to get started!</p>
              </div>
            ) : (
              sites.map((site) => {
                const siteJobs = jobs.filter((j) => j.site_id === site.id);
                const newCount = siteJobs.filter((j) => j.is_new).length;

                return (
                  <div key={site.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900 text-sm">{site.name}</h3>
                          <span className="text-xs text-gray-400">
                            {siteJobs.length} jobs
                          </span>
                          {newCount > 0 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {newCount} new
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{site.url}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleScrape(site.id)}
                          disabled={scraping}
                          className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50 transition-colors"
                        >
                          Scrape
                        </button>
                        <button
                          onClick={() => setEditingSite(site)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSite(site.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Compact Jobs List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {showNewOnly ? 'New Jobs' : 'All Jobs'} ({jobs.length})
            </h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm">Loading...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm">No jobs found. Try scraping some sites!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {jobs.map((job: any) => (
                <div
                  key={job.id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                    job.is_new ? 'bg-green-50/30 border-l-2 border-l-green-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 text-sm">{job.title}</h3>
                        {job.is_new && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{job.sites?.name}</span>
                        {job.company && <span>• {job.company}</span>}
                        {job.location && <span>• {job.location}</span>}
                        <span>• {formatRelativeTime(job.discovered_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.is_new && (
                        <button
                          onClick={() => handleMarkAsSeen(job.id)}
                          className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark as seen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Open job posting"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
