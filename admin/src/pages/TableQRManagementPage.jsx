import React, { useEffect, useState } from 'react';
import {
  getAdminTables,
  createTable,
  updateTable,
  regenerateTableQR,
  refreshTableQRImage,
  syncAllTableQRs,
  deleteTable,
} from '../services/adminApi';
import {
  Plus,
  QrCode,
  Download,
  RefreshCw,
  Printer,
  Trash2,
  Users,
  MapPin,
  X,
  ExternalLink,
  Copy,
  Check,
  Globe,
} from 'lucide-react';

export const TableQRManagementPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [previewTable, setPreviewTable] = useState(null);
  const [copied, setCopied] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newCapacity, setNewCapacity] = useState(4);
  const [newLocation, setNewLocation] = useState('Main Dining Hall');

  const getDestinationUrl = (table) => {
    if (!table) return '';
    if (table.qrCodeUrl) return table.qrCodeUrl;
    const customerDomain =
      import.meta.env.VITE_PUBLIC_MENU_URL || 'https://qissa-arabic-restaurant.vercel.app';
    return `${customerDomain.replace(/\/$/, '')}/menu/${table.qrToken}`;
  };

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await getAdminTables();
      setTables(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const created = await createTable({
        label: newLabel,
        capacity: newCapacity,
        location: newLocation,
      });
      setTables((prev) => [...prev, created]);
      setIsAddOpen(false);
      setNewLabel('');
    } catch (err) {
      alert('Failed to add table: ' + (err.response?.data?.message || err.message));
    }
  };

  // Sync / update all table QRs to encode the canonical public domain while keeping all tokens
  const handleSyncAll = async () => {
    if (
      !window.confirm(
        'Update all table QR codes to point to the live public customer menu (https://qissa-arabic-restaurant.vercel.app)? All existing table tokens and history will be preserved.'
      )
    ) {
      return;
    }
    try {
      setSyncing(true);
      const res = await syncAllTableQRs();
      setTables(res.data);
      alert(res.message || 'All table QR codes successfully updated to the public domain!');
    } catch (err) {
      alert('Failed to sync QR codes: ' + (err.response?.data?.message || err.message));
    } finally {
      setSyncing(false);
    }
  };

  // Refresh QR image for single table without modifying token
  const handleRefreshImage = async (table) => {
    try {
      const res = await refreshTableQRImage(table._id);
      setTables((prev) => prev.map((t) => (t._id === table._id ? res.data : t)));
      if (previewTable?._id === table._id) {
        setPreviewTable(res.data);
      }
      alert(`QR Code image for Table ${table.label} updated with the public customer URL.`);
    } catch (err) {
      alert('Failed to refresh QR image: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRegenerate = async (table) => {
    if (
      window.confirm(
        `Are you sure you want to generate a brand new token for Table ${table.label}? Old printed QR codes for this table will stop working immediately.`
      )
    ) {
      try {
        const res = await regenerateTableQR(table._id);
        setTables((prev) => prev.map((t) => (t._id === table._id ? res.data : t)));
        if (previewTable?._id === table._id) {
          setPreviewTable(res.data);
        }
      } catch (err) {
        alert('Failed to regenerate QR.');
      }
    }
  };

  const handleDelete = async (id, label) => {
    if (window.confirm(`Delete Table ${label}?`)) {
      try {
        await deleteTable(id);
        setTables((prev) => prev.filter((t) => t._id !== id));
      } catch (err) {
        alert('Failed to delete table.');
      }
    }
  };

  const downloadQR = (table) => {
    const link = document.createElement('a');
    link.href = table.qrCodeDataUrl;
    link.download = `Qissa_Table_${table.label}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printTableTent = (table) => {
    const destUrl = getDestinationUrl(table);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Table ${table.label} - Qissa Arabic Restaurant</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; margin: 0; background: #FAF6F0; }
            .card { max-width: 400px; margin: auto; border: 2px solid #E8602C; border-radius: 28px; padding: 36px 28px; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
            h1 { color: #E8602C; font-size: 24px; margin: 0 0 6px 0; font-family: serif; letter-spacing: 0.5px; }
            .arabic { font-size: 18px; color: #C9953C; margin-bottom: 20px; font-weight: bold; }
            .table-badge { background: #1A1A1A; color: white; display: inline-block; padding: 8px 24px; border-radius: 24px; font-weight: bold; font-size: 20px; margin-bottom: 20px; letter-spacing: 1px; }
            img { width: 250px; height: 250px; margin: 10px auto; border-radius: 12px; }
            p { font-size: 13px; color: #555; line-height: 1.5; margin: 16px 0 8px 0; }
            .url-text { font-family: monospace; font-size: 10px; color: #888; word-break: break-all; margin-top: 12px; }
          </style>
        </head>
        <body onload="window.print();window.close();">
          <div class="card">
            <h1>QISSA ARABIC RESTAURANT</h1>
            <div class="arabic">مطعم قصة للمأكولات العربية</div>
            <div class="table-badge">TABLE ${table.label}</div>
            <br />
            <img src="${table.qrCodeDataUrl}" alt="QR Code" />
            <p><strong>Scan with your smartphone camera</strong><br />to browse our full digital menu, specials & place your order.</p>
            <div class="url-text">${destUrl}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            Table & QR Code Management
          </h1>
          <p className="text-xs text-[#6B655D] mt-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Public Menu Destination:</span>
            <span className="font-mono text-emerald-700 font-bold">
              https://qissa-arabic-restaurant.vercel.app
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#E0D7C9] hover:border-[#E8602C] text-[#1A1A1A] hover:text-[#E8602C] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Update all existing QR images to use the public production domain while preserving tokens"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#E8602C]' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync All QRs to Public Domain'}</span>
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#E8602C] hover:bg-[#D14E1E] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#E8602C]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Table</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <div
            key={table._id}
            className="bg-white rounded-3xl p-6 border border-[#E9ECEF] shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-2xl font-bold text-[#1A1A1A]">
                  Table {table.label}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    table.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {table.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#6B655D] mb-6">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#E8602C]" />
                  <span>{table.capacity} Guests</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E8602C]" />
                  <span>{table.location}</span>
                </span>
              </div>

              {/* QR Preview Box */}
              <div
                onClick={() => setPreviewTable(table)}
                className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#F2EBE0] flex flex-col items-center justify-center cursor-pointer hover:border-[#E8602C] transition-colors group mb-4"
              >
                <img
                  src={table.qrCodeDataUrl}
                  alt={`QR for ${table.label}`}
                  className="w-32 h-32 object-contain group-hover:scale-105 transition-transform"
                />
                <span className="text-[10px] font-semibold text-[#E8602C] mt-2 group-hover:underline">
                  Click to Preview & Test
                </span>
              </div>

              <div className="text-[11px] text-[#6B655D] space-y-0.5">
                <p>
                  <strong>Total Scans:</strong> {table.scanCount || 0}
                </p>
                <p className="truncate font-mono text-[10px] text-gray-400">
                  Token: {table.qrToken}
                </p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 mt-4 border-t border-[#E9ECEF] flex items-center justify-between gap-1.5 flex-wrap">
              <button
                onClick={() => downloadQR(table)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-[#1A1A1A] transition-colors cursor-pointer"
                title="Download PNG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>

              <button
                onClick={() => printTableTent(table)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-[#1A1A1A] transition-colors cursor-pointer"
                title="Print Table Tent Card"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={() => handleRefreshImage(table)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-xs font-semibold text-[#E8602C] transition-colors cursor-pointer"
                title="Refresh QR image with public domain (preserves table token)"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Update QR</span>
              </button>

              <button
                onClick={() => handleRegenerate(table)}
                className="p-1.5 text-[#6B655D] hover:text-[#E8602C] rounded-xl hover:bg-[#FAF6F0] cursor-pointer"
                title="Regenerate New Token (Caution: invalidates old prints)"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDelete(table._id, table.label)}
                className="p-1.5 text-[#6B655D] hover:text-rose-600 rounded-xl hover:bg-rose-50 cursor-pointer"
                title="Delete Table"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Table Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-serif font-bold text-lg">Add New Dining Table</h3>
              <button onClick={() => setIsAddOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Table Label * (e.g. T06)</label>
                <input
                  type="text"
                  required
                  placeholder="T06"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl font-bold uppercase"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Area / Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F9FA] border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E8602C] text-white font-bold rounded-xl"
                >
                  Create & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Large Preview & Test Modal */}
      {previewTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative">
            <button
              onClick={() => setPreviewTable(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9953C]">
              Table QR Code
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1A1A1A] mt-1 mb-3">
              Table {previewTable.label}
            </h2>

            <div className="p-4 bg-white border-2 border-[#E8602C] rounded-2xl inline-block shadow-md mb-4">
              <img
                src={previewTable.qrCodeDataUrl}
                alt="QR Code"
                className="w-56 h-56 object-contain"
              />
            </div>

            {/* Destination URL Box with One-Click Copy */}
            <div className="bg-[#FAF6F0] p-3 rounded-2xl border border-[#F2EBE0] mb-4 text-left">
              <span className="text-[10px] font-bold text-[#8C8275] uppercase tracking-wider block mb-1">
                Public Customer Menu Destination
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[#1A1A1A] truncate select-all font-semibold">
                  {getDestinationUrl(previewTable)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getDestinationUrl(previewTable));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E0D7C9] hover:border-[#E8602C] text-[11px] font-bold text-[#1A1A1A] flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-[#6B655D]" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[#6B655D] mb-5">
              When guests scan this code with their smartphone camera, the live digital menu will
              automatically open with Table {previewTable.label} mapped.
            </p>

            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <a
                href={getDestinationUrl(previewTable)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#E8602C] hover:bg-[#D14E1E] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Open Live Menu</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => downloadQR(previewTable)}
                className="px-3.5 py-2.5 rounded-xl border border-gray-300 hover:border-[#E8602C] text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
              <button
                onClick={() => printTableTent(previewTable)}
                className="px-3.5 py-2.5 rounded-xl border border-gray-300 hover:border-[#E8602C] text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tent</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
