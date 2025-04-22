
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    // all in spring ? 
        // save()
        // findById()
        // findAll()
        // deleteById()

    @Query("SELECT d FROM Document d WHERE d.id = :id AND (d.owner = :user OR :user MEMBER OF d.collaborators)")
    Optional<Document> findByIdAndUserHasAccess(Long id, User user);

    @Query("SELECT d FROM Document d WHERE d.owner = :user OR :user MEMBER OF d.collaborators")
    List<Document> findAllDocsUserCanAccess(User user);
}
