import { GitHubUser, GitHubUserSchema, UserDetails } from "../types";
export class GitHubUserBuilder {
  private data: Partial<GitHubUser> = {};

  constructor() {
    this.data = {
      id: Math.floor(Math.random() * 100000),
      login: "default-user",
      avatar_url: "https://github.com/default-user.png",
      html_url: "https://github.com/default-user",
      followers: 0,
      following: 0,
      public_repos: 0,
      bio: null,
      company: null,
      location: null,
      created_at: new Date(),
    };
  }

  withId(id: number): this {
    this.data.id = id;
    return this;
  }

  withLogin(login: string): this {
    this.data.login = login;
    this.data.avatar_url = `https://github.com/${login}.png`;
    this.data.html_url = `https://github.com/${login}`;
    return this;
  }

  withAvatarUrl(avatarUrl: string): this {
    this.data.avatar_url = avatarUrl;
    return this;
  }

  withHtmlUrl(htmlUrl: string): this {
    this.data.html_url = htmlUrl;
    return this;
  }

  withFollowers(count: number): this {
    this.data.followers = count;
    return this;
  }

  withFollowing(count: number): this {
    this.data.following = count;
    return this;
  }

  withPublicRepos(count: number): this {
    this.data.public_repos = count;
    return this;
  }

  withBio(bio: string | null): this {
    this.data.bio = bio;
    return this;
  }

  withCreatedAt(date: Date): this {
    this.data.created_at = date;
    return this;
  }

  withCompany(company: string | null): this {
    this.data.company = company;
    return this;
  }

  withLocation(location: string | null): this {
    this.data.location = location;
    return this;
  }

  withStats(followers: number, following: number, repos: number): this {
    this.data.followers = followers;
    this.data.following = following;
    this.data.public_repos = repos;
    return this;
  }

  withProfile(
    bio: string,
    company: string | null,
    location: string | null,
  ): this {
    this.data.bio = bio;
    this.data.company = company;
    this.data.location = location;
    return this;
  }

  build(): GitHubUser {
    return GitHubUserSchema.parse(this.data);
  }

  buildSafe(): GitHubUser | null {
    const result = GitHubUserSchema.safeParse(this.data);
    return result.success ? result.data : null;
  }

  static create(): GitHubUserBuilder {
    return new GitHubUserBuilder();
  }

  static withLogin(login: string): GitHubUserBuilder {
    return new GitHubUserBuilder().withLogin(login);
  }
}

export class UserDetailsBuilder {
  private user: GitHubUser;
  private rank: number = 0;

  constructor(user: GitHubUser) {
    this.user = user;
  }

  withFollowersRank(rank: number): this {
    this.rank = rank;
    return this;
  }

  build(): UserDetails {
    return UserDetails.parse({
      ...this.user,
      followersRank: this.rank,
    });
  }

  static fromUser(user: GitHubUser): UserDetailsBuilder {
    return new UserDetailsBuilder(user);
  }

  static fromBuilder(builder: GitHubUserBuilder): UserDetailsBuilder {
    return new UserDetailsBuilder(builder.build());
  }
}
