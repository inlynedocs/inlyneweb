
@Service
public class DocumentService {
    @Autowired
    private DocumentRepository documentRepo;

    @Autowired
    private UserRepository userRepo;

    public User getCurrentUser(Long userId) {
        return userRepo.findById(userId).orElseThrow();
    }

    public List<Document> getAllDocs(Long userId) {
        User user = getCurrentUser(userId);
        return documentRepo.findAllDocsUserCanAccess(user);
    }

    public Document getDoc(Long docId, Long userId) {
        User user = getCurrentUser(userId);
        return documentRepo.findByIdAndUserHasAccess(docId, userId).orElse(null);
    }

    public Document createDoc(Document doc, Long userId) {
        User user = getCurrentUser(userId);
        doc.setOwner(user);
        doc.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        doc.setUpdatedAt(doc.getCreatedAt());
        return documentRepo.save(doc);
    }

    public Document updateDoc(Long id, Document updatedDoc) {
        User user = getCurrentUser(userId);
        return documentRepo.findByIdAndUserHasAccess(docId, user).map(doc -> {
            doc.setTitle(updatedDoc.getTitle());
            doc.setContent(updatedDoc.getContent());
            doc.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            return documentRepo.save(doc);
        }).orElse(null);
    }

    public void deleteDoc(Long id) {
        User user = getCurrentUser(userId);
        return documentRepo.findByIdAndUserHasAccess(docId, user).map(doc -> {
            documentRepo.deleteById(docId);
            return true;
        }).orElse(false);
    }
}