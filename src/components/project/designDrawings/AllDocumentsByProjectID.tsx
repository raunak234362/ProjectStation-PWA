/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useMemo } from "react";
import Service from "../../../api/Service";
import RenderFiles from "../../ui/RenderFiles";
import { Loader2, ChevronDown, Filter, FileText, Layers, Search, Calendar, X } from "lucide-react";
import { useParams } from "react-router-dom";

const AllDocumentsByProjectID = ({ projectId }: { projectId?: string }) => {
  const { id } = useParams<{ id: string }>();
  const finalId = projectId || id;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // Filters State
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!finalId) return;
      try {
        setLoading(true);
        const response = await Service.GetAllDocumentsByProjectId(finalId);
        setData(response?.data || null);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [finalId]);

  const availableStages = useMemo(() => {
    if (!data) return ["All"];
    const stages = new Set<string>();
    const allItems = [
      ...(data.project?.files || []),
      ...(data.designDrawings || []),
      ...(data.changeOrders || []),
      ...(data.notes || []),
      ...(data.rfi || []),
      ...(data.submittals || []),
      ...(data.bfa ? (Array.isArray(data.bfa) ? data.bfa : [data.bfa]) : []),
      ...(data.bfas || []),
      ...(data.rfq || []),
      ...(data.coordinationDrawings || []),
      ...(data.progressReports || [])
    ];
    allItems.forEach((item: any) => {
      if (item.stage) stages.add(item.stage);
      const files = item.files || (item.file ? [item.file] : []);
      files.forEach((f: any) => { if (f.stage) stages.add(f.stage); });
    });
    return ["All", ...Array.from(stages).sort()];
  }, [data]);

  const processedData = useMemo(() => {
    if (!data) return null;

    const matchesFilters = (file: any, parent: any = {}) => {
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const name = (file.originalName || file.name || "").toLowerCase();
        const parentDesc = (parent.description || parent.subject || parent.title || "").toLowerCase();
        const responseReason = (file.responseReason || file.reason || "").toLowerCase();
        const fileType = (file.fileType || file.type || "").toLowerCase();
        const originType = (file.originType || file.fileCategory || "").toLowerCase();
        const uploader = file.user
          ? `${file.user.firstName || file.user.f_name || ""} ${file.user.lastName || file.user.l_name || ""}`.toLowerCase()
          : "";

        const matchesQuery =
          name.includes(query) ||
          parentDesc.includes(query) ||
          responseReason.includes(query) ||
          fileType.includes(query) ||
          originType.includes(query) ||
          uploader.includes(query);

        if (!matchesQuery) return false;
      }

      const stage = file.stage || parent.stage || "";
      const stageMatch = selectedStage === "All" || stage === selectedStage;

      const dateStr = file.uploadedAt || file.createdAt || parent.createdAt || parent.date;
      const fileDate = dateStr ? dateStr.split("T")[0] : "";
      const dateMatch = !selectedDate || fileDate === selectedDate;

      return stageMatch && dateMatch;
    };

    const getItemFiles = (item: any): any[] => {
      if (!item) return [];
      const extracted: any[] = [];

      const addFiles = (f: any, meta: any = {}) => {
        if (!f) return;
        if (Array.isArray(f)) {
          f.forEach((fileObj) => {
            if (fileObj && typeof fileObj === "object") {
              extracted.push({ ...fileObj, ...meta });
            }
          });
        } else if (typeof f === "object") {
          extracted.push({ ...f, ...meta });
        }
      };

      const isSubmittal =
        item.serialNo?.startsWith("SUB") ||
        item.submittalNumber != null ||
        item.versions != null ||
        item.submittalsResponse != null ||
        item.submittalResponses != null;

      const processBfaStructure = (bfaObj: any) => {
        if (!bfaObj) return;
        const bfaId = bfaObj.id || bfaObj._id || item.id;
        const bfaSubject = bfaObj.subject || bfaObj.title || item.subject;

        if (Array.isArray(bfaObj.versions)) {
          bfaObj.versions.forEach((bv: any, bIdx: number) => {
            const vNum = bv.versionNumber || (bfaObj.versions.length - bIdx);
            const bfaMeta = {
              originType: "BFA",
              fileCategory: "bfa",
              fileType: "BFA File",
              versionNumber: vNum,
              overrideTable: "bfa",
              table: "bfa",
              documentID: bfaId,
              overrideDocumentID: bfaId,
              versionId: bv.id,
              user: bv.user || bv.sender || bfaObj.user || item.user,
              uploadedAt: bv.createdAt || bv.date || bfaObj.createdAt || item.createdAt,
              stage: bv.stage || bfaObj.stage || item.stage,
              bfaSubject,
            };
            addFiles(bv.files, bfaMeta);
            addFiles(bv.file, bfaMeta);
          });
        }
        const directBfaFiles = bfaObj.files || bfaObj.file;
        if (directBfaFiles) {
          const bfaMeta = {
            originType: "BFA",
            fileCategory: "bfa",
            fileType: "BFA File",
            overrideTable: "bfa",
            table: "bfa",
            documentID: bfaId,
            overrideDocumentID: bfaId,
            user: bfaObj.user || bfaObj.sender || item.user,
            uploadedAt: bfaObj.createdAt || bfaObj.date || item.createdAt,
            stage: bfaObj.stage || item.stage,
            bfaSubject,
          };
          addFiles(directBfaFiles, bfaMeta);
        }
      };

      if (isSubmittal) {
        // 1. Submittal currentVersion & versions
        if (item.currentVersion) {
          const v = item.currentVersion;
          const vNum = v.versionNumber || (Array.isArray(item.versions) ? item.versions.length : 1);
          const submittalMeta = {
            originType: "SUBMITTAL",
            fileCategory: "submittal",
            fileType: `Submittal (v${vNum})`,
            table: "submittals",
            overrideTable: "submittals",
            documentID: item.id,
            overrideDocumentID: item.id,
            versionId: v.id,
            versionNumber: vNum,
            uploadedAt: v.createdAt || item.createdAt || item.date,
            user: v.user || v.sender || item.user || item.sender,
            stage: v.stage || item.stage,
          };
          addFiles(v.files, submittalMeta);
          addFiles(v.file, submittalMeta);
        }

        if (Array.isArray(item.versions)) {
          item.versions.forEach((v: any, idx: number) => {
            const vNum = v.versionNumber || (item.versions.length - idx);
            const submittalMeta = {
              originType: "SUBMITTAL",
              fileCategory: "submittal",
              fileType: `Submittal (v${vNum})`,
              table: "submittals",
              overrideTable: "submittals",
              documentID: item.id,
              overrideDocumentID: item.id,
              versionId: v.id,
              versionNumber: vNum,
              uploadedAt: v.createdAt || item.createdAt || item.date,
              user: v.user || v.sender || item.user || item.sender,
              stage: v.stage || item.stage,
            };
            addFiles(v.files, submittalMeta);
            addFiles(v.file, submittalMeta);
          });
        }

        // 2. Direct files on submittal
        if (item.files || item.file) {
          const submittalMeta = {
            originType: "SUBMITTAL",
            fileCategory: "submittal",
            fileType: "Submittal File",
            table: "submittals",
            overrideTable: "submittals",
            documentID: item.id,
            overrideDocumentID: item.id,
            uploadedAt: item.createdAt || item.date,
            user: item.user || item.sender,
            stage: item.stage,
          };
          addFiles(item.files, submittalMeta);
          addFiles(item.file, submittalMeta);
        }

        // 3. Submittal responses
        const subResponses = item.submittalsResponse || item.submittalResponses || item.responses;
        if (Array.isArray(subResponses)) {
          const processSubResponses = (respList: any[]) => {
            respList.forEach((resp: any) => {
              const respMeta = {
                originType: "RESPONSE",
                fileCategory: "response",
                fileType: "Response File",
                responseReason: resp.reason || resp.description || resp.responseReason || "",
                responseStatus: resp.status || resp.responseStatus || "",
                user: resp.user || resp.sender,
                uploadedAt: resp.createdAt || resp.date || resp.updatedAt,
                overrideTable: "submittalsResponse",
                table: "submittalsResponse",
                documentID: resp.id,
                overrideDocumentID: resp.id,
                submittalId: item.id,
                stage: resp.stage || item.stage,
              };
              addFiles(resp.files, respMeta);
              addFiles(resp.file, respMeta);
              if (Array.isArray(resp.childResponses)) {
                processSubResponses(resp.childResponses);
              }
            });
          };
          processSubResponses(subResponses);
        }

        // 4. BFA files inside submittal
        if (item.bfa) {
          if (Array.isArray(item.bfa)) item.bfa.forEach(processBfaStructure);
          else processBfaStructure(item.bfa);
        }
        if (Array.isArray(item.bfas)) item.bfas.forEach(processBfaStructure);
        if (item.bfaFiles || item.bfa_files) {
          const bfaMeta = {
            originType: "BFA",
            fileCategory: "bfa",
            fileType: "BFA File",
            overrideTable: "bfa",
            table: "bfa",
            documentID: item.bfa?.id || item.id,
            overrideDocumentID: item.bfa?.id || item.id,
            user: item.user || item.sender,
            uploadedAt: item.createdAt || item.date,
            stage: item.stage,
          };
          addFiles(item.bfaFiles || item.bfa_files, bfaMeta);
        }
      } else {
        // Direct files / file for other documents
        addFiles(item.files);
        addFiles(item.file);

        if (item.table === "bfa" || (item.versions && item.subject?.includes("BFA"))) {
          processBfaStructure(item);
        }

        // RFI responses / rfiresponse
        const responses = item.responses || item.rfiresponse;
        if (Array.isArray(responses)) {
          const processResponses = (respList: any[]) => {
            respList.forEach((resp: any) => {
              const respMeta = {
                originType: "RESPONSE",
                fileCategory: "response",
                fileType: "Response File",
                responseReason: resp.reason || resp.description || resp.responseReason || "",
                responseStatus: resp.status || resp.responseStatus || "",
                overrideTable: "rFIResponse",
                overrideDocumentID: resp.id,
                uploadedAt: resp.createdAt || resp.date,
                user: resp.user,
                stage: resp.stage || item.stage,
              };
              addFiles(resp.files, respMeta);
              addFiles(resp.file, respMeta);
              if (Array.isArray(resp.childResponses)) {
                processResponses(resp.childResponses);
              }
            });
          };
          processResponses(responses);
        }
      }

      // Deduplicate by file id or url or stringified object
      const seen = new Set();
      const uniqueFiles: any[] = [];
      extracted.forEach((fileObj) => {
        const key = fileObj.id || fileObj.url || fileObj.path || JSON.stringify(fileObj);
        if (!seen.has(key)) {
          seen.add(key);
          uniqueFiles.push(fileObj);
        }
      });

      return uniqueFiles;
    };

    const filterFlatFiles = (files: any[]) => files.filter(f => matchesFilters(f));

    const filterNestedItems = (items: any[]) => {
      return items.map(item => {
        const itemFiles = getItemFiles(item);
        const filteredFiles = itemFiles.filter((f: any) => matchesFilters(f, item));
        const parentMatches = matchesFilters({}, item);

        if (filteredFiles.length > 0) {
          return { ...item, files: filteredFiles };
        } else if (parentMatches) {
          return { ...item, files: [] };
        }
        return null;
      }).filter(Boolean);
    };

    // Dedicated BFA items from top-level data and submittals
    const rawBfaList = Array.isArray(data.bfa)
      ? data.bfa
      : (data.bfa ? [data.bfa] : (Array.isArray(data.bfas) ? data.bfas : []));

    const submittalBfas: any[] = [];
    (data.submittals || []).forEach((sub: any) => {
      if (sub.bfa) {
        const bList = Array.isArray(sub.bfa) ? sub.bfa : [sub.bfa];
        bList.forEach((b: any) => {
          submittalBfas.push({
            ...b,
            id: b.id || sub.id,
            subject: b.subject || `BFA: ${sub.subject || 'Submittal BFA'}`,
            description: `BFA: ${b.subject || sub.subject || 'Back From Approval'}`,
            stage: b.stage || sub.stage,
            bfa: b,
          });
        });
      } else if (Array.isArray(sub.bfas) && sub.bfas.length > 0) {
        sub.bfas.forEach((b: any) => {
          submittalBfas.push({
            ...b,
            id: b.id || sub.id,
            subject: b.subject || `BFA: ${sub.subject || 'Submittal BFA'}`,
            description: `BFA: ${b.subject || sub.subject || 'Back From Approval'}`,
            stage: b.stage || sub.stage,
            bfa: b,
          });
        });
      } else if (sub.bfaFiles?.length > 0 || sub.bfa_files?.length > 0) {
        submittalBfas.push({
          id: sub.id,
          subject: `BFA: ${sub.subject || 'Submittal BFA'}`,
          description: `BFA: ${sub.subject || 'Back From Approval'}`,
          stage: sub.stage,
          bfaFiles: sub.bfaFiles || sub.bfa_files,
        });
      }
    });

    const allBfasMap = new Map<string, any>();
    [...rawBfaList, ...submittalBfas].forEach((bfaItem: any) => {
      const key = bfaItem.id || JSON.stringify(bfaItem);
      if (!allBfasMap.has(key)) {
        allBfasMap.set(key, bfaItem);
      }
    });
    const allBfas = Array.from(allBfasMap.values());

    return {
      projectFiles: filterFlatFiles(data.project?.files || []),
      designDrawings: filterNestedItems(data.designDrawings || []),
      changeOrders: filterNestedItems((data.changeOrders || []).map((co: any) => ({
        ...co,
        description: `Change Order: ${co.changeOrderNumber || "Unknown"}`,
      }))),
      notes: filterNestedItems((data.notes || []).map((note: any) => ({
        ...note,
        description: `Note (${note.stage})`,
      }))),
      rfis: filterNestedItems((data.rfi || []).map((rfi: any) => ({
        ...rfi,
        description: `RFI: ${rfi.subject}`,
      }))),
      submittals: filterNestedItems((data.submittals || []).map((sub: any) => {
        const subTitle = sub.subject || sub.submittalNumber || sub.title || sub.serialNo || (sub.versionNumber ? `Submittal v${sub.versionNumber}` : 'Submittal Attachments');
        return {
          ...sub,
          description: String(subTitle).toLowerCase().startsWith('submittal') ? subTitle : `Submittal: ${subTitle}`,
        };
      })),
      bfas: filterNestedItems(allBfas.map((bfa: any) => ({
        ...bfa,
        description: bfa.description || `BFA: ${bfa.subject || 'Back From Approval'}`,
      }))),
      rfqs: filterNestedItems((data.rfq || []).map((rfq: any) => ({
        ...rfq,
        description: `RFQ: ${rfq.subject}`,
      }))),
      coordinationDrawings: filterNestedItems((data.coordinationDrawings || []).map((cd: any) => ({
        ...cd,
        description: `Coordination Drawing: ${cd.title || cd.description || "No Description"}`,
      }))),
      progressReports: filterNestedItems((data.progressReports || []).map((pr: any) => ({
        ...pr,
        description: `Progress Report: ${pr.title || "No Title"}`,
      }))),
    };
  }, [data, searchQuery, selectedStage, selectedDate]);

  if (loading || !data || !processedData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-700">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        {loading ? "Loading Documents..." : "No Documents Available"}
      </div>
    );
  }

  const { projectFiles, designDrawings, changeOrders, notes, rfis, submittals, bfas, rfqs, coordinationDrawings, progressReports } = processedData;

  const categories = [
    { id: "All", label: "All Files", count: (projectFiles.length + designDrawings.length + changeOrders.length + rfis.length + submittals.length + bfas.length + notes.length + rfqs.length + coordinationDrawings.length + progressReports.length) },
    { id: "Project Documents", label: "Project Documents", count: projectFiles.length },
    { id: "Documents", label: "Design Drawings", count: designDrawings.length },
    { id: "Change Orders", label: "Change Orders", count: changeOrders.length },
    { id: "Requests for Information (RFI)", label: "RFI", count: rfis.length },
    { id: "Submittals", label: "Submittals", count: submittals.length },
    { id: "BFA", label: "BFA", count: bfas.length },
    { id: "RFQ", label: "RFQ", count: rfqs.length },
    { id: "Coordination Drawings", label: "Coordination Drawings", count: coordinationDrawings.length },
    { id: "Progress Reports", label: "Progress Reports", count: progressReports.length },
    { id: "Notes", label: "Notes", count: notes.length },
  ].filter(cat => cat.id === "All" || cat.count > 0);

  const formatDate = (date: any) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "—";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Integrated Filters (RFQ Style) */}
      <div className="mb-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Search Bar */}
          <div className="relative group max-w-xl flex-1 min-w-[300px]">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl blur-sm opacity-25 group-hover:opacity-40 transition-all duration-1000"></div>
            <div className="relative bg-white border border-gray-100 rounded-xl flex items-center shadow-sm hover:border-green-200 transition-colors">
              <Search className="ml-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH FILE..."
                className="flex-1 px-4 py-2 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none font-medium text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 px-3 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Stage Select */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-white border border-black/10 px-4 py-2 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              {availableStages.map((s) => (
                <option key={s} value={s}>{s === "All" ? "ALL STAGES" : s}</option>
              ))}
            </select>

            {/* Date Input */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-black/10 px-4 py-2 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />

            {/* Category Dropdown (Replacing previous complex header button) */}
            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-2 bg-white border border-black/10 px-4 py-2 rounded-xl text-sm font-semibold focus:outline-none hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 text-[#6bbd45]" />
                {categories.find((c) => c.id === selectedCategory)?.label || "ALL FILES"}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoryOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-black/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in duration-200">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-green-50 text-green-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {cat.id === "All" ? <Layers className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        {cat.label}
                      </div>
                      <span className="text-sm bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-semibold">{cat.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Total Files Info */}
            <span className="text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-xl border border-gray-200">
              {categories.find(c => c.id === selectedCategory)?.count} FILES
            </span>

            {/* Reset Button */}
            {(searchQuery || selectedStage !== "All" || selectedDate || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStage("All");
                  setSelectedDate("");
                  setSelectedCategory("All");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <X size={16} strokeWidth={3} />
                RESET
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {projectFiles.length > 0 && (selectedCategory === "All" || selectedCategory === "Project Documents") && (
          <Section title="Project Documents">
            <RenderFiles files={projectFiles} table="project" parentId={finalId || ""} hideHeader={true} formatDate={formatDate} />
          </Section>
        )}
        {designDrawings.length > 0 && (selectedCategory === "All" || selectedCategory === "Documents") && (
          <Section title="Documents">
            <RenderFiles files={designDrawings} table="designDrawings" parentId={finalId || ""} hideHeader={true} formatDate={formatDate} />
          </Section>
        )}
        {changeOrders.length > 0 && (selectedCategory === "All" || selectedCategory === "Change Orders") && (
          <Section title="Change Orders">
            <RenderFiles files={changeOrders} table="changeOrder" parentId={finalId || ""} hideHeader={true} formatDate={formatDate} />
          </Section>
        )}
        {rfis.length > 0 && (selectedCategory === "All" || selectedCategory === "Requests for Information (RFI)") && (
          <Section title="Requests for Information (RFI)">
            <RenderFiles files={rfis} table="rFI" parentId={finalId || ""} hideHeader={true} formatDate={formatDate} />
          </Section>
        )}
        {submittals.length > 0 && (selectedCategory === "All" || selectedCategory === "Submittals") && (
          <Section title="Submittals">
            <RenderFiles files={submittals} table="submittals" parentId={finalId || ""} hideHeader={true} formatDate={formatDate} />
          </Section>
        )}
        {bfas.length > 0 && (selectedCategory === "All" || selectedCategory === "BFA") && (
          <Section title="Back From Approval (BFA)">
            <RenderFiles files={bfas} table="bfa" parentId={finalId || ""} hideHeader={true} formatDate={formatDate} />
          </Section>
        )}
        {rfqs.length > 0 && (selectedCategory === "All" || selectedCategory === "RFQ") && (
          <Section title="Request for Quotation (RFQ)">
            <RenderFiles files={rfqs} table="rFQ" parentId={finalId || ""} hideHeader={true} formatDate={formatDate} />
          </Section>
        )}
        {coordinationDrawings.length > 0 && (selectedCategory === "All" || selectedCategory === "Coordination Drawings") && (
          <Section title="Coordination Drawings">
            <RenderFiles files={coordinationDrawings} table="coordinationDrawing" parentId={finalId || ""} hideHeader={true} formatDate={formatDate} />
          </Section>
        )}
        {progressReports.length > 0 && (selectedCategory === "All" || selectedCategory === "Progress Reports") && (
          <Section title="Progress Reports">
            <RenderFiles files={progressReports} table="projectProgressReport" parentId={finalId || ""} hideHeader={true} formatDate={formatDate} />
          </Section>
        )}
        {notes.length > 0 && (selectedCategory === "All" || selectedCategory === "Notes") && (
          <Section title="Notes">
            <RenderFiles files={notes} table="project" parentId={finalId || ""} hideHeader={true} formatDate={formatDate} />
          </Section>
        )}
        {Object.values(processedData).every(arr => arr.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
            <Search className="w-12 h-12 mb-4 text-gray-200" />
            <p className="text-sm font-semibold">No Data Found</p>

          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-lg text-black font-black uppercase tracking-tight ml-1">{title}</h3>
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {children}
    </div>
  </div>
);

export default AllDocumentsByProjectID;
