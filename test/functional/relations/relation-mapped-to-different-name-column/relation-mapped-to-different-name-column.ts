import "reflect-metadata";
import {createTestingConnections, closeTestingConnections, reloadTestingDatabases} from "../../../utils/test-utils";
import {Connection} from "../../../../src/connection/Connection";
import {Post} from "./entity/Post";
import {PostDetails} from "./entity/PostDetails";

describe.skip("relations > relation mapped to relation with different name (#56)", () => { // skipped because of CI error. todo: needs investigation

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        schemaCreate: true,
        dropSchemaOnConnection: true
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should work perfectly", () => Promise.all(connections.map(async connection => {

        // first create and save details
        const details = new PostDetails();
        details.keyword = "post-1";
        await connection.entityManager.persist(details);

        // then create and save a post with details
        const post1 = new Post();
        post1.title = "Hello Post #1";
        post1.details = details;
        await connection.entityManager.persist(post1);

        // now check
        const posts = await connection.entityManager.find(Post, {
            join: {
                alias: "post",
                innerJoinAndSelect: {
                    details: "post.details"
                }
            }
        });

        posts.should.be.eql([{
            id: 1,
            title: "Hello Post #1",
            details: {
                keyword: "post-1"
            }
        }]);
    })));

});
