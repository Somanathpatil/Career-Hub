import { useEffect, useState } from "react";
import {
  Users as UsersIcon,
  Search,
  Trash2,
  Mail,
  Phone,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/api";
import Navbar from "../components/Navbar";

const ViewAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error("Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      setDeleting(true);
      await api.delete(`/api/users/${deleteUserId}`);
      toast.success("User deleted successfully!");
      setDeleteUserId(null);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && String(u.phone).includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Banner */}
        <section className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-950/10">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <UsersIcon size={14} />
              Administration & Members
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Platform Registered Users
            </h1>
            <p className="mt-2 max-w-xl text-sm sm:text-base text-slate-300">
              Manage member accounts, view user directory, and inspect registered
              learner profiles.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 border border-white/15 px-6 py-4 text-center shrink-0">
            <span className="block text-3xl font-black text-white">
              {users.length}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Total Users
            </span>
          </div>
        </section>

        {/* Search */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by username, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-3 text-blue-600" size={36} />
              <p className="text-sm font-medium">Loading user accounts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <UsersIcon size={36} className="mx-auto mb-3 text-slate-400" />
              <h3 className="text-base font-bold text-slate-800">
                No users found
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Try a different search query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      User
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Email Address
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-4">
                      User ID
                    </th>
                    <th scope="col" className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.userId}
                      className="hover:bg-slate-50/70 transition"
                    >
                      {/* Username */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold">
                            {u.username?.slice(0, 2).toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {u.username}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Learner Member
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Mail size={15} className="text-slate-400" />
                          <span>{u.email || "No email"}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone size={15} className="text-slate-400" />
                          <span>{u.phone || "—"}</span>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-semibold text-slate-400">
                        #{u.userId}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setDeleteUserId(u.userId)}
                          className="inline-flex items-center gap-1 rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Delete User Confirmation Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="rounded-xl bg-red-50 p-2.5">
                <ShieldAlert size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete user #{deleteUserId}? This action
              cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteUserId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllUsers;
