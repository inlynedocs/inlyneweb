@RestController
@RequestMapping("/docs/") // rename base URL ?
public class DocumentController {
    @Autowired
    private DocumentService documentService;

    @GetMapping
    public List<Document> getAllDocuments(@RequestParam Long userId) {
        return documentService.getAllDocs(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocument(@PathVariable Long docId, @RequestParam Long userId) {
        Document doc = documentService.getDoc(docId, userId);
        return (doc != null) ? ResponseEntity.ok(doc) : ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping
    public Document createDocument(@RequestBody Document doc, @RequestParam Long userId) {
        return documentService.createDoc(doc, userId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(@PathVariable Long docId, @RequestBody Document doc, @RequestParam Long userId) {
        Document updated = documentService.updateDoc(docId, doc, userId);
        return (updated != null) ? ResponseEntity.ok(updated) : ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long docId, @RequestParam Long userId) {
        boolean deleted = documentService.deleteDoc(docId, userId);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}