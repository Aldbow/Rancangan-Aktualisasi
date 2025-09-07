"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Building2,
  Star,
  Send,
  CheckCircle,
  Award,
  TrendingUp,
  FileText,
  Lock,
  User,
  Shield,
  LogOut,
  ArrowRight,
  ArrowLeft,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Penyedia, PPK } from "@/lib/google-sheets";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface PPKOptions {
  eselonI: { value: string; label: string }[];
  satuanKerja: { value: string; label: string }[];
}

export default function PenilaianPage() {
  // PPK Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedPPK, setAuthenticatedPPK] = useState<PPK | null>(null);
  const [authForm, setAuthForm] = useState({
    nama: "",
    nip: "",
    eselonI: "",
    satuanKerja: "",
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState("");
  const [ppkOptions, setPpkOptions] = useState<PPKOptions>({
    eselonI: [],
    satuanKerja: [],
  });
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Evaluation State
  const [searchQuery, setSearchQuery] = useState("");
  const [penyediaList, setPenyediaList] = useState<Penyedia[]>([]);
  const [selectedPenyedia, setSelectedPenyedia] = useState<Penyedia | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: search, 2: info, 3: rating

  // Form data untuk penilaian
  const [formData, setFormData] = useState({
    kualitasKuantitasBarangJasa: 1,
    komentarKualitasKuantitasBarangJasa: "",
    biaya: 1,
    komentarBiaya: "",
    waktu: 1,
    komentarWaktu: "",
    layanan: 1,
    komentarLayanan: "",
    keterangan: "",
  });

  // Kriteria penilaian sesuai LKPP
  const kriteriaPenilaian = [
    {
      key: "kualitasKuantitasBarangJasa",
      label: "Kualitas dan Kuantitas Pekerjaan",
      description:
        "Penilaian terhadap kualitas dan kuantitas barang/jasa yang diserahkan",
      bobot: "30%",
      kriteria: {
        1: "Cukup (Skor 1): Lebih dari 50% hasil pekerjaan memerlukan perbaikan/penggantian agar sesuai dengan ketentuan kontrak.",
        2: "Baik (Skor 2): Kurang dari atau sama dengan 50% hasil pekerjaan memerlukan perbaikan/penggantian agar sesuai dengan ketentuan kontrak.",
        3: "Sangat Baik (Skor 3): Hasil pekerjaan sesuai dengan ketentuan kontrak tanpa memerlukan perbaikan/penggantian, atau 100% hasil pekerjaan sesuai dengan ketentuan dalam kontrak.",
      },
    },
    {
      key: "biaya",
      label: "Biaya",
      description:
        "Penilaian terhadap pengendalian biaya dan perubahan kontrak",
      bobot: "20%",
      kriteria: {
        1: "Cukup (Skor 1): Tidak melakukan pengendalian biaya dengan baik dan/atau mengajukan perubahan kontrak yang tidak didasari alasan yang dapat dipertanggungjawabkan, sehingga penambahan biaya tidak dapat diantisipasi. Kriteria ini juga mencakup tidak menginformasikan sejak awal kondisi yang berpotensi menambah biaya dan mengajukan perubahan kontrak yang akan berdampak pada penambahan total biaya tanpa alasan memadai sehingga ditolak PPK.",
        2: "Baik (Skor 2): Melakukan pengendalian biaya dan/atau mengajukan perubahan kontrak yang didasari alasan yang dapat dipertanggungjawabkan, sehingga penambahan biaya dapat diantisipasi. Kriteria ini juga mencakup melakukan salah satu kondisi pada kriteria Cukup.",
        3: "Sangat Baik (Skor 3): Telah melakukan pengendalian biaya dengan baik dengan menginformasikan sejak awal kondisi yang berpotensi menambah biaya dan perubahan kontrak yang diajukan sudah didasari alasan yang dapat dipertanggungjawabkan, sehingga penambahan biaya dapat diantisipasi.",
      },
    },
    {
      key: "waktu",
      label: "Waktu",
      description: "Penilaian terhadap ketepatan waktu penyelesaian pekerjaan",
      bobot: "30%",
      kriteria: {
        1: "Cukup (Skor 1): Penyelesaian pekerjaan terlambat melebihi 50 (lima puluh) hari kalender dari waktu yang ditetapkan dalam kontrak karena kesalahan Penyedia.",
        2: "Baik (Skor 2): Penyelesaian pekerjaan terlambat sampai dengan 50 (lima puluh) hari kalender dari waktu yang ditetapkan dalam kontrak karena kesalahan Penyedia.",
        3: "Sangat Baik (Skor 3): Penyelesaian pekerjaan sesuai dengan waktu yang ditetapkan dalam kontrak atau lebih cepat sesuai dengan kebutuhan PPK.",
      },
    },
    {
      key: "layanan",
      label: "Layanan",
      description:
        "Penilaian terhadap responsivitas dan kualitas layanan penyedia",
      bobot: "20%",
      kriteria: {
        1: "Cukup (Skor 1): Penyedia lambat memberi tanggapan positif atas permintaan PPK dan/atau sulit diajak berdiskusi dalam penyelesaian pelaksanaan pekerjaan.",
        2: "Baik (Skor 2): Merespon permintaan dengan penyelesaian sesuai yang diminta atau Penyedia mudah dihubungi dan berdiskusi dalam penyelesaian pelaksanaan pekerjaan.",
        3: "Sangat Baik (Skor 3): Merespon permintaan dengan penyelesaian sesuai yang diminta dan Penyedia mudah dihubungi serta berdiskusi dalam penyelesaian pelaksanaan pekerjaan.",
      },
    },
  ];

  // Skala penilaian sesuai LKPP (1-3)
  const skalaPenilaian = [
    { value: 1, label: "Cukup", color: "text-yellow-600 bg-yellow-100", textColor: "text-yellow-800 dark:text-yellow-200" },
    { value: 2, label: "Baik", color: "text-blue-600 bg-blue-100", textColor: "text-blue-800 dark:text-blue-200" },
    { value: 3, label: "Sangat Baik", color: "text-green-600 bg-green-100", textColor: "text-green-800 dark:text-green-200" },
  ];

  // Load PPK options on component mount
  useEffect(() => {
    const loadPPKOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const response = await fetch("/api/penilaian/ppk-options");
        if (response.ok) {
          const data = await response.json();
          setPpkOptions(data);
        }
      } catch (error) {
        console.error("Error loading PPK options:", error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadPPKOptions();
  }, []);

  // PPK Authentication function
  const authenticatePPK = async () => {
    if (
      !authForm.nama.trim() ||
      !authForm.nip.trim() ||
      !authForm.eselonI.trim() ||
      !authForm.satuanKerja.trim()
    ) {
      setAuthError(
        "Semua field harus diisi (Nama, NIP, Eselon I, dan Satuan Kerja)"
      );
      return;
    }

    setIsAuthenticating(true);
    setAuthError("");

    try {
      const response = await fetch("/api/penilaian/validate-ppk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: authForm.nama.trim(),
          nip: authForm.nip.trim(),
          eselonI: authForm.eselonI.trim(),
          satuanKerja: authForm.satuanKerja.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setAuthenticatedPPK(data.ppk);
        setAuthError("");
        setCurrentStep(1); // Reset to first step
      } else {
        setAuthError(data.error || "Validasi gagal");
      }
    } catch (error) {
      console.error("Error authenticating PPK:", error);
      setAuthError("Terjadi kesalahan saat validasi. Silakan coba lagi.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle auth form input change
  const handleAuthInputChange = (field: string, value: string) => {
    setAuthForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (authError) {
      setAuthError("");
    }
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setAuthenticatedPPK(null);
    setAuthForm({ nama: "", nip: "", eselonI: "", satuanKerja: "" });
    setSelectedPenyedia(null);
    setSearchQuery("");
    setPenyediaList([]);
    setFormData({
      kualitasKuantitasBarangJasa: 1,
      komentarKualitasKuantitasBarangJasa: "",
      biaya: 1,
      komentarBiaya: "",
      waktu: 1,
      komentarWaktu: "",
      layanan: 1,
      komentarLayanan: "",
      keterangan: "",
    });
    setCurrentStep(1);
  };

  // Fetch penyedia berdasarkan search
  const searchPenyedia = async (query: string) => {
    if (!query.trim()) {
      setPenyediaList([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/penyedia?search=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setPenyediaList(data);
      }
    } catch (error) {
      console.error("Error searching penyedia:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPenyedia(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle form input change
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate weighted score based on LKPP formula
  const calculateWeightedScore = () => {
    const weightedScore =
      formData.kualitasKuantitasBarangJasa * 0.3 +
      formData.biaya * 0.2 +
      formData.waktu * 0.3 +
      formData.layanan * 0.2;
    return weightedScore.toFixed(2);
  };

  // Get final evaluation based on weighted score
  const getFinalEvaluation = () => {
    const score = parseFloat(calculateWeightedScore());
    if (score === 0) return "Buruk";
    if (score >= 1 && score < 2) return "Cukup";
    if (score >= 2 && score < 3) return "Baik";
    if (score === 3) return "Sangat Baik";
    return "Cukup"; // fallback
  };

  // Get rating color based on score
  const getRatingColor = (score: number) => {
    if (score >= 2.5) return "text-green-600";
    if (score >= 2.0) return "text-blue-600";
    if (score >= 1.0) return "text-yellow-600";
    return "text-red-600";
  };

  // Check if form can be submitted
  const canSubmit = selectedPenyedia && authenticatedPPK;

  // Submit penilaian
  const submitPenilaian = async () => {
    if (!canSubmit) {
      alert("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const penilaianData = {
        idPenyedia: selectedPenyedia!.id,
        namaPPK: authenticatedPPK!.nama,
        tanggalPenilaian: new Date().toISOString().split("T")[0],
        kualitasKuantitasBarangJasa: formData.kualitasKuantitasBarangJasa,
        komentarKualitasKuantitasBarangJasa:
          formData.komentarKualitasKuantitasBarangJasa,
        biaya: formData.biaya,
        komentarBiaya: formData.komentarBiaya,
        waktu: formData.waktu,
        komentarWaktu: formData.komentarWaktu,
        layanan: formData.layanan,
        komentarLayanan: formData.komentarLayanan,
        keterangan: formData.keterangan,
      };

      const response = await fetch("/api/penilaian", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(penilaianData),
      });

      if (response.ok) {
        alert("Penilaian berhasil disimpan!");
        // Reset form
        setSelectedPenyedia(null);
        setFormData({
          kualitasKuantitasBarangJasa: 1,
          komentarKualitasKuantitasBarangJasa: "",
          biaya: 1,
          komentarBiaya: "",
          waktu: 1,
          komentarWaktu: "",
          layanan: 1,
          komentarLayanan: "",
          keterangan: "",
        });
        setSearchQuery("");
        setPenyediaList([]);
        setCurrentStep(1);
      } else {
        throw new Error("Gagal menyimpan penilaian");
      }
    } catch (error) {
      console.error("Error submitting penilaian:", error);
      alert("Terjadi kesalahan saat menyimpan penilaian");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // If not authenticated, show PPK authentication form
  if (!isAuthenticated) {
    return (
      <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Shield className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                Validasi PPK
              </h1>
              <p className="mt-3 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Masukkan nama lengkap dan NIP Anda untuk mengakses sistem penilaian penyedia
              </p>
            </div>
          </div>
        </motion.div>

        {/* PPK Authentication Form */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-2 border-dashed border-blue-300/50 bg-gradient-to-br from-white/80 to-blue-50/30 dark:from-slate-800/80 dark:to-slate-900/30 shadow-xl rounded-3xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center space-x-3 text-xl lg:text-2xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Autentikasi PPK</span>
              </CardTitle>
              <CardDescription className="text-base">
                Silakan masukkan nama lengkap dan NIP sesuai dengan data PPK yang terdaftar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="nama"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Nama Lengkap *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="nama"
                      type="text"
                      placeholder="Masukkan nama lengkap Anda"
                      value={authForm.nama}
                      onChange={(e) =>
                        handleAuthInputChange("nama", e.target.value)
                      }
                      className="pl-10 py-5 text-base rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isAuthenticating}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="nip"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    NIP *
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="nip"
                      type="text"
                      placeholder="Masukkan NIP Anda"
                      value={authForm.nip}
                      onChange={(e) =>
                        handleAuthInputChange("nip", e.target.value)
                      }
                      className="pl-10 py-5 text-base rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isAuthenticating}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Eselon I *
                  </Label>
                  <SearchableSelect
                    options={ppkOptions.eselonI}
                    value={authForm.eselonI}
                    onValueChange={(value) =>
                      handleAuthInputChange("eselonI", value)
                    }
                    placeholder="Pilih Eselon I..."
                    searchPlaceholder="Cari Eselon I..."
                    disabled={isAuthenticating || isLoadingOptions}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Satuan Kerja *
                  </Label>
                  <SearchableSelect
                    options={ppkOptions.satuanKerja}
                    value={authForm.satuanKerja}
                    onValueChange={(value) =>
                      handleAuthInputChange("satuanKerja", value)
                    }
                    placeholder="Pilih Satuan Kerja..."
                    searchPlaceholder="Cari Satuan Kerja..."
                    disabled={isAuthenticating || isLoadingOptions}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {isLoadingOptions && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-base text-muted-foreground">
                    Memuat data...
                  </span>
                </div>
              )}

              {authError && (
                <motion.div 
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-base text-red-600 dark:text-red-400">
                    {authError}
                  </p>
                </motion.div>
              )}

              <Button
                onClick={authenticatePPK}
                disabled={
                  isAuthenticating ||
                  !authForm.nama.trim() ||
                  !authForm.nip.trim() ||
                  !authForm.eselonI.trim() ||
                  !authForm.satuanKerja.trim() ||
                  isLoadingOptions
                }
                className="w-full py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isAuthenticating ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Memvalidasi...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <Shield className="h-5 w-5" />
                    <span>Validasi PPK</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // If authenticated, show the evaluation form
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header with PPK Info */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <FileText className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
              Penilaian Penyedia
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Berikan penilaian terhadap penyedia barang/jasa berdasarkan kriteria LKPP
            </p>
          </div>
        </div>
      </motion.div>

      {/* PPK Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-700 rounded-2xl shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <span>PPK Terautentikasi</span>
              </CardTitle>
              <Button
                onClick={logout}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/30 rounded-xl"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-300">Nama</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {authenticatedPPK?.nama}
                </p>
              </div>
              <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-300">NIP</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {authenticatedPPK?.nip}
                </p>
              </div>
              <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-300">Satuan Kerja</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {authenticatedPPK?.satuanKerja}
                </p>
              </div>
              <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-300">Eselon I</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {authenticatedPPK?.eselonI}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stepper */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep === step
                    ? "bg-blue-600 text-white shadow-lg"
                    : currentStep > step
                    ? "bg-green-500 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    currentStep > step
                      ? "bg-green-500"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Search Penyedia */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-dashed border-blue-300/50 bg-gradient-to-br from-white/80 to-blue-50/30 dark:from-slate-800/80 dark:to-slate-900/30 shadow-xl rounded-3xl overflow-hidden backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl lg:text-2xl">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-base">
                    1
                  </div>
                  <span>Pilih Penyedia</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Cari dan pilih penyedia yang akan dinilai
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Cari nama perusahaan atau NPWP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-5 text-base border border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 dark:bg-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm hover:shadow-md"
                  />
                </div>

                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-muted-foreground text-lg">
                      Mencari penyedia...
                    </span>
                  </div>
                )}

                <AnimatePresence>
                  {penyediaList.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent rounded-lg"
                    >
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Ditemukan {penyediaList.length} penyedia
                      </div>
                      
                      {penyediaList.map((penyedia) => (
                        <motion.div
                          key={penyedia.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ 
                            scale: 1.02,
                            y: -3,
                            transition: { duration: 0.2 }
                          }}
                          onClick={() => {
                            setSelectedPenyedia(penyedia);
                            setCurrentStep(2);
                          }}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                            selectedPenyedia?.id === penyedia.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-opacity-50 shadow-lg"
                              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/10 dark:hover:to-blue-800/10 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">
                                {penyedia.namaPerusahaan}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                {penyedia.jenisUsaha}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 break-all">
                                NPWP: {penyedia.npwp}
                              </p>
                            </div>
                            {selectedPenyedia?.id === penyedia.id && (
                              <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0 ml-3" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end">
                  <Button
                    onClick={goToNextStep}
                    disabled={!selectedPenyedia}
                    className="px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    Lanjut
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Informasi Penyedia */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 rounded-3xl shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3 text-xl lg:text-2xl">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-base">
                      2
                    </div>
                    <span>Informasi Penyedia Terpilih</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPenyedia(null)}
                    className="rounded-xl"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Ganti Penyedia
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-white/70 dark:bg-slate-800/70 p-5 rounded-2xl shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Data Perusahaan
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Nama Perusahaan
                          </p>
                          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {selectedPenyedia?.namaPerusahaan}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Jenis Usaha
                          </p>
                          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {selectedPenyedia?.jenisUsaha}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            NPWP
                          </p>
                          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {selectedPenyedia?.npwp}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white/70 dark:bg-slate-800/70 p-5 rounded-2xl shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Informasi Kontak
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Kontak
                          </p>
                          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {selectedPenyedia?.kontak || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Alamat
                          </p>
                          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {selectedPenyedia?.alamat || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Tanggal Registrasi
                          </p>
                          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {selectedPenyedia?.tanggalRegistrasi 
                              ? new Date(selectedPenyedia.tanggalRegistrasi).toLocaleDateString("id-ID")
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button
                    onClick={goToPrevStep}
                    variant="outline"
                    className="px-6 py-3 text-base font-semibold rounded-xl"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Kembali
                  </Button>
                  <Button
                    onClick={goToNextStep}
                    className="px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Lanjut ke Penilaian
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Rating Form */}
        {currentStep === 3 && selectedPenyedia && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-dashed border-purple-300/50 bg-gradient-to-br from-white/80 to-purple-50/30 dark:from-slate-800/80 dark:to-slate-900/30 shadow-xl rounded-3xl overflow-hidden backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl lg:text-2xl">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold text-base">
                    3
                  </div>
                  <span>Berikan Penilaian</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Berikan skor 1-3 untuk setiap kriteria penilaian sesuai standar LKPP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {kriteriaPenilaian.map((criteria, index) => (
                  <motion.div
                    key={criteria.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="space-y-5 p-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/50 shadow-sm"
                  >
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <Label className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                          {criteria.label}
                        </Label>
                        <Badge variant="secondary" className="text-sm py-1 px-3 rounded-full">
                          Bobot: {criteria.bobot}
                        </Badge>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        {criteria.description}
                      </p>
                    </div>

                    {/* Rating buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      {skalaPenilaian.map((skala) => (
                        <motion.button
                          key={skala.value}
                          type="button"
                          onClick={() =>
                            handleInputChange(criteria.key, skala.value)
                          }
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-6 py-3 rounded-xl border-2 font-semibold text-base transition-all duration-300 ${
                            formData[criteria.key as keyof typeof formData] ===
                            skala.value
                              ? `${skala.color} border-transparent text-white shadow-lg`
                              : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-500 shadow-sm"
                          }`}
                        >
                          {skala.value}
                        </motion.button>
                      ))}
                      <div className="ml-2">
                        <span
                          className={`text-lg font-semibold px-4 py-2 rounded-full ${
                            skalaPenilaian.find(
                              (s) =>
                                s.value ===
                                formData[criteria.key as keyof typeof formData]
                            )?.color || "bg-slate-100 dark:bg-slate-700 text-slate-500"
                          }`}
                        >
                          {
                            skalaPenilaian.find(
                              (s) =>
                                s.value ===
                                formData[criteria.key as keyof typeof formData]
                            )?.label || "Belum dipilih"
                          }
                        </span>
                      </div>
                    </div>

                    {/* Comment field for this criteria */}
                    <div className="space-y-2">
                      <Label className="font-medium text-slate-700 dark:text-slate-300">
                        Komentar {criteria.label} (Opsional)
                      </Label>
                      <Textarea
                        value={(() => {
                          const commentKey = `komentar${
                            criteria.key.charAt(0).toUpperCase() +
                            criteria.key.slice(1)
                          }`;
                          return (
                            (formData[
                              commentKey as keyof typeof formData
                            ] as string) || ""
                          );
                        })()}
                        onChange={(e) => {
                          const commentKey = `komentar${
                            criteria.key.charAt(0).toUpperCase() +
                            criteria.key.slice(1)
                          }`;
                          handleInputChange(commentKey, e.target.value);
                        }}
                        placeholder={`Berikan komentar tambahan untuk aspek ${criteria.label.toLowerCase()}...`}
                        className="min-h-[100px] text-base rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Criteria description */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                      <p className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Kriteria Penilaian:
                      </p>
                      <div className="space-y-2">
                        {Object.entries(criteria.kriteria).map(([score, desc]) => (
                          <div key={score} className="flex items-start space-x-3">
                            <span
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                parseInt(score) === 1
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                                  : parseInt(score) === 2
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                              }`}
                            >
                              {score}
                            </span>
                            <span className="text-slate-600 dark:text-slate-300">
                              {desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Keterangan */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="space-y-3"
                >
                  <Label className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Keterangan Tambahan (Opsional)
                  </Label>
                  <Textarea
                    value={formData.keterangan}
                    onChange={(e) =>
                      handleInputChange("keterangan", e.target.value)
                    }
                    placeholder="Berikan keterangan tambahan mengenai penilaian ini..."
                    className="min-h-[120px] text-base rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </motion.div>

                {/* Weighted Score Display */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="mt-2 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-700 shadow-sm"
                >
                  <div className="text-center space-y-5">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      Hasil Penilaian
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-white/70 dark:bg-slate-800/70 p-5 rounded-xl">
                        <p className="text-slate-600 dark:text-slate-300 mb-2">
                          Skor Total (Berbobot)
                        </p>
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                          {calculateWeightedScore()}
                        </div>
                      </div>

                      <div className="bg-white/70 dark:bg-slate-800/70 p-5 rounded-xl">
                        <p className="text-slate-600 dark:text-slate-300 mb-2">
                          Penilaian Akhir
                        </p>
                        <div
                          className={`text-3xl font-bold ${getRatingColor(parseFloat(calculateWeightedScore()))}`}
                        >
                          {getFinalEvaluation()}
                        </div>
                      </div>
                    </div>

                    <div className="max-w-md mx-auto w-full">
                      <Progress
                        value={(parseFloat(calculateWeightedScore()) / 3) * 100}
                        className="h-3 rounded-full"
                      />
                    </div>

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Formula: (Kualitas×30%) + (Biaya×20%) + (Waktu×30%) +
                      (Layanan×20%)
                    </div>
                  </div>
                </motion.div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                  <Button
                    onClick={goToPrevStep}
                    variant="outline"
                    className="px-6 py-3 text-base font-semibold rounded-xl"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Kembali
                  </Button>
                  
                  <Button
                    onClick={submitPenilaian}
                    disabled={isSubmitting}
                    className="px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Menyimpan...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Send className="h-5 w-5" />
                        <span>Simpan Penilaian</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}