
@Entity
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // id of doc
    private String title; // title to doc? 

    @Column(columnDefinition = "TEXT")
    private String content; // contents

    private Timestamp createdAt; // created
    private Timestamp updatedAt; // updated


    @ManyToOne
    @JoinColumn(name = "owner")
    private User owner;

    @ManyToMany
    @JoinTable(
        name = "document_collaborators",
        joinColumns = @JoinColumn(name = "document_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> collaborators = new ArrayList<>();
}
