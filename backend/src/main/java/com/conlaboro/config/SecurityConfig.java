package com.conlaboro.config;

import com.conlaboro.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 认证相关 - 公开
                .requestMatchers("/api/auth/**").permitAll()
                // 项目列表和详情 - 允许游客浏览
                .requestMatchers(HttpMethod.GET, "/api/projects").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/projects/{id:[\\d]+}").permitAll()
                // 用户相关 - 允许游客查看
                .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll()
                // 排行榜 - 公开
                .requestMatchers(HttpMethod.GET, "/api/leaderboard").permitAll()
                // 统计数据 - 公开
                .requestMatchers(HttpMethod.GET, "/api/stats").permitAll()
                // 徽章列表 - 公开
                .requestMatchers(HttpMethod.GET, "/api/badges").permitAll()
                // 项目活动流 - 公开
                .requestMatchers(HttpMethod.GET, "/api/activities/project/{projectId:[\\d]+}").permitAll()
                // 想法墙 - 允许游客查看
                .requestMatchers(HttpMethod.GET, "/api/ideas").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/ideas/{id:[\\d]+}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/ideas/{id:[\\d]+}/comments").permitAll()
                // OPTIONS 预检请求
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // 健康检查
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                // 其他需要认证
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
