import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, Pencil, Trash2, LogOut, Award } from "lucide-react";
import { addressesApi } from "../../api/orders";
import { useAuth } from "../../context/AuthContext";
import { Input, Checkbox } from "../../components/ui/Input";
import { PrimaryButton, SecondaryButton, IconButton } from "../../components/ui/Button";
import { Modal, Dropdown } from "../../components/ui/Overlay";
import { LoadingSpinner, EmptyState, ErrorState } from "../../components/ui/Feedback";
import { Breadcrumb } from "../../components/ui/Navigation";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

const EMPTY_ADDRESS = {
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "GB",
  phone: "",
  isDefault: false,
};

function AddressForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initial || EMPTY_ADDRESS);
  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label="First name" value={form.firstName} onChange={setField("firstName")} required />
        <Input label="Last name" value={form.lastName} onChange={setField("lastName")} required />
      </div>
      <Input label="Address line 1" value={form.line1} onChange={setField("line1")} required />
      <Input label="Address line 2 (optional)" value={form.line2 || ""} onChange={setField("line2")} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" value={form.city} onChange={setField("city")} required />
        <Input label="Postal code" value={form.postalCode} onChange={setField("postalCode")} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="State / County" value={form.state || ""} onChange={setField("state")} />
        <Input label="Country" value={form.country} onChange={setField("country")} maxLength={2} required />
      </div>
      <Input label="Phone (optional)" value={form.phone || ""} onChange={setField("phone")} />
      <Checkbox
        checked={form.isDefault}
        onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
        label="Set as default address"
      />
      <div className="mt-2 flex justify-end gap-3">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" loading={submitting}>
          Save address
        </PrimaryButton>
      </div>
    </form>
  );
}

export default function Account() {
  useDocumentTitle("My Account");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const { data: addresses = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["addresses"],
    queryFn: addressesApi.list,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["addresses"] });

  const createMutation = useMutation({
    mutationFn: (payload) => addressesApi.create(payload),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => addressesApi.update(id, payload),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
      setEditingAddress(null);
    },
  });
  const removeMutation = useMutation({
    mutationFn: (id) => addressesApi.remove(id),
    onSuccess: invalidate,
  });

  const openCreate = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };
  const openEdit = (address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-3xl px-6 py-10 md:py-14">
        <div className="mb-6">
          <Breadcrumb items={[{ label: "My Profile" }]} />
        </div>

        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              {user?.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{user?.email}</p>
          </div>
          <SecondaryButton leftIcon={LogOut} onClick={handleLogout}>
            Log out
          </SecondaryButton>
        </div>

        <div className="mb-8 flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <span className="grid size-11 place-items-center rounded-full bg-gold-400/12 text-gold-500">
            <Award className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{user?.rewardPoints ?? 0} reward points</p>
            <p className="text-xs text-[var(--text-muted)]">Earned automatically when your orders are delivered.</p>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
            Saved Addresses
          </h2>
          <PrimaryButton size="sm" leftIcon={Plus} onClick={openCreate}>
            Add address
          </PrimaryButton>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" label="Loading addresses..." />
          </div>
        ) : isError ? (
          <ErrorState description="We couldn't load your addresses." onRetry={refetch} />
        ) : addresses.length === 0 ? (
          <EmptyState icon={MapPin} title="No saved addresses" description="Add an address to speed up checkout next time." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {address.firstName} {address.lastName}
                      {address.isDefault && <span className="ml-2 text-xs text-gold-500">Default</span>}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.postalCode}, {address.country}
                    </p>
                  </div>
                  <Dropdown trigger={<IconButton icon={Pencil} size="sm" aria-label="Address actions" />}>
                    <Dropdown.Item icon={Pencil} onClick={() => openEdit(address)}>
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Separator />
                    <Dropdown.Item icon={Trash2} destructive onClick={() => removeMutation.mutate(address.id)}>
                      Delete
                    </Dropdown.Item>
                  </Dropdown>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingAddress(null);
          }}
          title={editingAddress ? "Edit address" : "Add address"}
        >
          <AddressForm
            initial={editingAddress}
            submitting={createMutation.isPending || updateMutation.isPending}
            onCancel={() => {
              setModalOpen(false);
              setEditingAddress(null);
            }}
            onSubmit={(payload) =>
              editingAddress ? updateMutation.mutate({ id: editingAddress.id, payload }) : createMutation.mutate(payload)
            }
          />
        </Modal>
      </div>
    </div>
  );
}
