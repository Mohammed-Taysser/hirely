import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Pencil, Check, Award } from "lucide-react";
import { CertificationItem, ResumeSection } from "@/types";

interface CertificationsEditorProps {
  section: ResumeSection;
  onUpdate: (content: CertificationItem[]) => void;
}

const emptyCertification: Omit<CertificationItem, "id"> = {
  name: "",
  issuer: "",
  date: "",
  expiryDate: "",
  credentialId: "",
};

export function CertificationsEditor({ section, onUpdate }: CertificationsEditorProps) {
  const certifications = section.content as CertificationItem[];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<CertificationItem, "id">>(emptyCertification);
  const [isAdding, setIsAdding] = useState(false);

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm(emptyCertification);
  };

  const startEditing = (cert: CertificationItem) => {
    setEditingId(cert.id);
    setIsAdding(false);
    setEditForm({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      expiryDate: cert.expiryDate || "",
      credentialId: cert.credentialId || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm(emptyCertification);
  };

  const saveCertification = () => {
    if (!editForm.name.trim() || !editForm.issuer.trim()) return;

    if (isAdding) {
      const newCert: CertificationItem = {
        id: `cert-${Date.now()}`,
        ...editForm,
      };
      onUpdate([...certifications, newCert]);
    } else if (editingId) {
      onUpdate(
        certifications.map((cert) =>
          cert.id === editingId ? { ...cert, ...editForm } : cert
        )
      );
    }
    cancelEdit();
  };

  const deleteCertification = (id: string) => {
    onUpdate(certifications.filter((cert) => cert.id !== id));
  };

  const renderForm = () => (
    <Card className="p-4 space-y-4 border-primary/20 bg-primary/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="name">Certification Name</Label>
          <Input
            id="name"
            placeholder="AWS Solutions Architect"
            value={editForm.name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="issuer">Issuing Organization</Label>
          <Input
            id="issuer"
            placeholder="Amazon Web Services"
            value={editForm.issuer}
            onChange={(e) => setEditForm((prev) => ({ ...prev, issuer: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="credentialId">Credential ID (Optional)</Label>
          <Input
            id="credentialId"
            placeholder="ABC123XYZ"
            value={editForm.credentialId}
            onChange={(e) => setEditForm((prev) => ({ ...prev, credentialId: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="date">Issue Date</Label>
          <Input
            id="date"
            type="month"
            value={editForm.date}
            onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
          <Input
            id="expiryDate"
            type="month"
            value={editForm.expiryDate}
            onChange={(e) => setEditForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={saveCertification} size="sm">
          <Check className="mr-1 h-4 w-4" />
          {isAdding ? "Add" : "Save"}
        </Button>
        <Button variant="outline" onClick={cancelEdit} size="sm">
          Cancel
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      {certifications.map((cert) =>
        editingId === cert.id ? (
          <div key={cert.id}>{renderForm()}</div>
        ) : (
          <Card key={cert.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Award className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Issued: {cert.date}
                    {cert.expiryDate && <span> • Expires: {cert.expiryDate}</span>}
                  </p>
                  {cert.credentialId && (
                    <p className="text-xs text-muted-foreground">
                      Credential ID: {cert.credentialId}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(cert)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCertification(cert.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )
      )}

      {isAdding && renderForm()}

      {!isAdding && !editingId && (
        <Button variant="outline" className="w-full border-dashed" onClick={startAdding}>
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      )}
    </div>
  );
}
